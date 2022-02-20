import { Context, u128, util, ContractPromiseBatch, logging } from "near-sdk-as";
import { getPaginationOffset, PaginationResult } from "../helper/pagination.helper";
import { EventStorage, UserEventStorage, UserInterestedEventStorage } from "../storage/event.storage";
import { FormStorage } from "../storage/form.storage";
import { ParticipantFormStorage } from "../storage/participant.storage";
import { UserStorage } from "../storage/user.storage";
import Base from "./base.model";
import { EVENT_TYPE } from "./event.model";
import Event from "./event.model";
import { FORM_TYPE } from "./form.model";
import Form from "./form.model";
import { ParticipantFormResponse } from "./response/participant_form";

export enum USER_STATUS {
    ACTIVE,
    INACTIVE,
}

export const OVER_CREATE_FORM_FEE = "500000000000000000000000";
export const CREATE_EVENT_COST = "10000000000000000000"; // 1 NEAR
export const JOIN_EVENT_COST = "100000000000000000"; // 0.01 NEAR
@nearBindgen
class User {
    private id: string;
    private status: USER_STATUS;
    private income: u128;
    private outcome: u128;
    private holding: u128;
    private created_at: u64;
    private last_modify: u64;
    private forms_owner: Set<string>;
    private events_owner: Set<string>;
    private forms_joined: Set<string>;
    private events_joined: Set<string>;
    private recent_event_created: string;

    constructor() {
        this.id = Context.sender;
        this.income = u128.Zero;
        this.outcome = u128.Zero;
        this.holding = u128.Zero;
        this.status = USER_STATUS.ACTIVE;
        this.created_at = Context.blockTimestamp / 1000000;
        if (this.forms_owner == null) {
            this.forms_owner = new Set<string>();
        }
        if (this.events_owner == null) {
            this.events_owner = new Set<string>();
        }

        if (this.forms_joined == null) {
            this.forms_joined = new Set<string>();
        }

        if (this.events_joined == null) {
            this.events_joined = new Set<string>();
        }
    }

    set_status(status: USER_STATUS): void {
        this.status = status;
    }

    get_status(): USER_STATUS {
        return this.status;
    }

    get_join_form_status(formId: string): bool {
        return this.forms_joined.has(formId);
    }

    get_joined_form(page: i32): PaginationResult<ParticipantFormResponse> {
        const forms = this.forms_joined.values();
        const forms_length = forms.length;
        const paginationOffset = getPaginationOffset(forms_length, page);

        const start_index = paginationOffset.startIndex;
        const end_index = paginationOffset.endIndex;
        let ret = new Set<ParticipantFormResponse>();
        for (let i = start_index; i >= end_index; i--) {
            const form_id = forms[i];
            const form = FormStorage.get(form_id);
            if (form == null) {
                continue;
            }
            const participant_form_id = `${this.id}_${form_id}`;
            const participant_form = ParticipantFormStorage.get(participant_form_id);

            if (participant_form == null) {
                continue;
            }

            const passed_question = participant_form.get_passed_question();
            ret.add(new ParticipantFormResponse(this.id, form_id, form.get_title(), passed_question, form.get_type(), participant_form.get_last_submited()));
        }
        return new PaginationResult(page, forms_length, ret.values());
    }

    get_joined_form_count(): i32 {
        return this.forms_joined.size;
    }

    get_income(): u128 {
        return this.income;
    }

    get_outcome(): u128 {
        return this.outcome;
    }

    get_form_owner_count(): i32 {
        return this.forms_owner.size;
    }

    get_event_owner_count(): i32 {
        return this.events_owner.size;
    }

    get_form_joined_count(): i32 {
        return this.forms_joined.size;
    }

    get_event_joined_count(): i32 {
        return this.events_joined.size;
    }

    remove_form_joined(form_id: string): void {
        if (this.forms_joined.has(form_id)) {
            this.forms_joined.delete(form_id);
            const participant_form_id = `${this.id}_${form_id}`;
            ParticipantFormStorage.delete(participant_form_id);
            this.save();
        }
    }

    create_form(title: string, description: string, type: FORM_TYPE): string | null {
        const created_forms = this.forms_owner.size;

        if (created_forms >= 3) {
            const deposited = Context.attachedDeposit;
            if (!this.isHalfNear(deposited)) {
                return null;
            }
            this.outcome = u128.sub(this.outcome, deposited);
        }

        const new_form = new Form(title, description, type);
        new_form.save();
        this.forms_owner.add(new_form.get_id());
        return new_form.get_id();
    }

    join_form(formId: string): bool {
        const existedForm = FormStorage.get(formId);
        if (existedForm == null) {
            return false;
        }

        if (this.forms_joined.has(existedForm.get_id())) {
            return false;
        }

        let join_stt: bool = false;
        let deposit_token = Context.attachedDeposit;
        const sender = Context.sender;

        if (u128.eq(u128.Zero, existedForm.get_enroll_fee()) || u128.ge(deposit_token, existedForm.get_enroll_fee())) {
            join_stt = existedForm.join();
        }

        if (!join_stt) {
            ContractPromiseBatch.create(sender).transfer(deposit_token);
        } else {
            if (u128.gt(deposit_token, existedForm.get_enroll_fee())) {
                const refund_amount = u128.sub(deposit_token, existedForm.get_enroll_fee());
                ContractPromiseBatch.create(sender).transfer(refund_amount);
            }
            this.outcome = u128.add(this.outcome, deposit_token);
            this.forms_joined.add(existedForm.get_id());
            this.save();
        }

        return join_stt;
    }

    delete_form(formId: string): bool {
        const existedForm = FormStorage.get(formId);

        if (existedForm == null) {
            return false;
        }

        existedForm.remove();
        this.forms_owner.delete(formId);

        this.save();
        return true;
    }

    public create_event(
        name: string,
        location: string,
        description: Set<string>,
        privacy: Set<string>,
        cover_image: string,
        event_type: EVENT_TYPE,
        start_date: u64,
        end_date: u64,
        url: string
    ): string | null {
        const deposit = Context.attachedDeposit;
        const sender = Context.sender;

        if (u128.lt(deposit, u128.from(CREATE_EVENT_COST))) {
            if (u128.eq(deposit, u128.from("0"))) {
                ContractPromiseBatch.create(sender).transfer(deposit);
            }
            return null;
        } else {
            const refund_amount = u128.sub(deposit, u128.from(CREATE_EVENT_COST));
            ContractPromiseBatch.create(sender).transfer(refund_amount);
        }

        const newEvent = new Event(name, location, description, privacy, cover_image, event_type, start_date, end_date, url);
        newEvent.save();
        this.events_owner.add(newEvent.get_id());
        let event_id: string = newEvent.get_id();
        this.recent_event_created = event_id;
        this.save();
        return event_id;
    }

    get_recent_event_created(): string {
        return this.recent_event_created;
    }

    join_event(eventId: string): bool {
        const existedEvent = EventStorage.get(eventId);
        if (existedEvent == null) {
            return false;
        }

        if (this.events_joined.has(existedEvent.get_id())) {
            return false;
        }

        let join_stt: bool = false;
        let deposit_token = Context.attachedDeposit;
        const sender = Context.sender;

        if (u128.eq(u128.Zero, existedEvent.get_enroll_fee()) || u128.ge(deposit_token, existedEvent.get_enroll_fee())) {
            join_stt = existedEvent.join();
        }

        if (!join_stt) {
            ContractPromiseBatch.create(sender).transfer(deposit_token);
        } else {
            if (u128.gt(deposit_token, existedEvent.get_enroll_fee())) {
                const refund_amount = u128.sub(deposit_token, existedEvent.get_enroll_fee());
                ContractPromiseBatch.create(sender).transfer(refund_amount);
            }
            this.outcome = u128.add(this.outcome, deposit_token);
            this.events_joined.add(existedEvent.get_id());
            this.save();
        }
        UserEventStorage.set(this.id, existedEvent.get_id());
        return join_stt;
    }

    delete_event(eventId: string): bool {
        const existedEvent = EventStorage.get(eventId);

        if (existedEvent == null) {
            return false;
        }

        existedEvent.remove();
        this.events_owner.delete(eventId);

        this.save();
        return true;
    }

    leave_event(eventId: string): bool {
        const existedEvent = EventStorage.get(eventId);

        if (existedEvent == null) {
            return false;
        }

        existedEvent.leave_event();
        this.events_owner.delete(eventId);
        this.events_joined.delete(eventId);
        this.save();
        UserEventStorage.delete(this.id, existedEvent.get_id());
        return true;
    }

    remove_event_joined(event_id: string): void {
        if (this.events_joined.has(event_id)) {
            this.events_joined.delete(event_id);
            this.save();
        }
    }

    save(): void {
        UserStorage.set(this.id, this);
    }

    private isHalfNear(value: u128): bool {
        return u128.eq(value, u128.from(OVER_CREATE_FORM_FEE));
    }
}

export default User;
