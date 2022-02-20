import { base58, Context, u128, util, ContractPromiseBatch } from "near-sdk-core";
import { FormStorage, UserFormStorage } from "../storage/form.storage";
import { UserAnswer } from "./passed_element";
import PassedElement from "./passed_element";
import Element from "./element.model";
import ParticipantForm from "./participant_form.model";
import { ElementType } from "./element.model";
import { ParticipantFormStorage, ParticipantStorage } from "../storage/participant.storage";
import { ElementStorage } from "../storage/element.storage";
import { WhiteListStorage } from "../storage/white_list.storage";
import { BlackListStorage } from "../storage/black_list.storage";
import { PassedElementStorage } from "../storage/passed_element";
import { getPaginationOffset, PaginationResult } from "../helper/pagination.helper";
import Base from "./base.model";
import { UserStorage } from "../storage/user.storage";

export enum FORM_STATUS {
    EDITING,
    STARTING,
    ENDED,
}

export enum FORM_TYPE {
    BASIC,
    CARD,
}

const DEAFULTS_WITHDRAW_FEE = 3; // %
const TEMP_STORAGE_FEE = "10000000000000000000000"; // // 0.01 NEAR = 1KB

@nearBindgen
class Form {
    public id: string;
    private owner: string;
    private status: FORM_STATUS;
    private created_at: u64;
    private limit_participants: i32;
    private enroll_fee: u128;
    public start_date: u64;
    public end_date: u64;
    private elements: Set<string>;
    private participants: Set<string>;
    private isRetry: bool = false;
    private nonce: i32 = 0;
    private isClaimed: bool = false;

    constructor(private title: string, private description: string, private type: FORM_TYPE) {
        this.owner = Context.sender;
        this.created_at = Context.blockTimestamp / 1000000;
        this.status = FORM_STATUS.EDITING;
        this.enroll_fee = u128.Zero;

        if (this.elements == null) {
            this.elements = new Set<string>();
        }

        if (this.participants == null) {
            this.participants = new Set<string>();
        }

        this.generate_id();
    }

    private generate_id(): void {
        let formId: string = "";
        while (formId == "") {
            const blockTime = Context.sender + Context.blockTimestamp.toString();
            const hBlockTime = base58.encode(util.stringToBytes(blockTime));
            if (!FormStorage.contains(hBlockTime)) {
                formId = hBlockTime;
            }
        }
        this.id = formId;
    }

    public get_type(): FORM_TYPE {
        return this.type;
    }

    public get_id(): string {
        return this.id;
    }

    public get_max_element(): i32 {
        return this.elements.size;
    }

    public get_owner(): string {
        return this.owner;
    }

    public get_limit_participant(): u32 {
        return this.limit_participants;
    }

    public get_enroll_fee(): u128 {
        return this.enroll_fee;
    }

    public get_status(): FORM_STATUS {
        return this.status;
    }

    public has_element(element_id: string): bool {
        return this.elements.has(element_id);
    }

    public has_participant(participant: string): bool {
        return this.participants.has(participant);
    }

    public set_enroll_fee(new_fee: u128): u128 {
        this.enroll_fee = new_fee;
        this.save();
        return this.enroll_fee;
    }

    public get_start_date(): u64 {
        return this.start_date;
    }

    public get_end_date(): u64 {
        return this.end_date;
    }

    public get_white_list(): string[] {
        return WhiteListStorage.get(this.id);
    }

    public set_white_list(userId: string): void {
        WhiteListStorage.set(this.id, userId);
    }

    public get_black_list(): string[] {
        return BlackListStorage.get(this.id);
    }

    public set_black_list(userId: string): void {
        BlackListStorage.set(this.id, userId);
    }

    public get_is_retry(): bool {
        return this.isRetry;
    }

    claim(): u128 {
        if (Context.blockTimestamp / 1000000 <= this.end_date || this.isClaimed) return u128.Zero;
        let claimedAmount: u128 = u128.Zero;
        for (let i = 0; i < this.participants.size; i++) {
            // TODO: Specific storage fee after merge fee feature
            claimedAmount = u128.add(claimedAmount, u128.sub(this.enroll_fee, u128.from(TEMP_STORAGE_FEE)));
        }
        let reward: u128 = u128.div(claimedAmount, u128.from(100));
        reward = u128.mul(reward, u128.sub(u128.from(100), u128.from(DEAFULTS_WITHDRAW_FEE)));
        let promise = ContractPromiseBatch.create(this.owner);
        if (!promise) return u128.Zero;
        promise.transfer(reward);
        this.isClaimed = true;
        this.save();
        return reward;
    }

    get_title(): string {
        return this.title;
    }

    set_title(newTitle: string): void {
        if (newTitle != "" && this.title != newTitle) {
            this.title = newTitle;
        }
    }

    set_description(newDescription: string): void {
        if (newDescription !== "" && this.description !== newDescription) {
            this.description = newDescription;
        }
    }

    get_description(): string {
        return this.description;
    }

    set_retry(value: bool): void {
        if (this.isRetry != value) {
            this.isRetry = value;
        }
    }

    get_next_element(userId: string): Element | null {
        if (this.status != FORM_STATUS.STARTING) {
            return null;
        }

        const participant_form_id = `${userId}_${this.id}`;

        const participant_form = ParticipantFormStorage.get(participant_form_id);

        if (participant_form != null) {
            const element_ids = this.elements.values();
            const element_ids_length = element_ids.length;

            const participant_element_passed = participant_form.get_passed_element_keys();
            const participant_element_passed_length = participant_element_passed.length;

            if (element_ids_length == participant_element_passed_length) {
                return null;
            }

            for (let i = 0; i < element_ids_length; i++) {
                if (!participant_element_passed.includes(element_ids[i])) {
                    return ElementStorage.get(element_ids[i]);
                }
            }
            return null;
        } else if (this.elements.size > 0) {
            const elementId = this.elements.values()[0];
            return ElementStorage.get(elementId);
        } else {
            return null;
        }
    }

    get_back_element(userId: string): Element | null {
        if (this.status != FORM_STATUS.STARTING) {
            return null;
        }

        const participant_form_id = `${userId}_${this.id}`;

        const participant_form = ParticipantFormStorage.get(participant_form_id);

        if (participant_form != null) {
            const participant_element_passed = participant_form.get_passed_element_keys();
            const participant_element_passed_length = participant_element_passed.length;

            if (participant_element_passed_length === 0) {
                return null;
            }

            return ElementStorage.get(participant_element_passed[participant_element_passed_length - 1]);
        } else {
            return null;
        }
    }

    save(): void {
        FormStorage.set(this.id, this);
        UserFormStorage.set(this.owner, this.id);
    }

    remove(): void {
        const currentTimestamp = Context.blockTimestamp / 100000;
        if (this.status === FORM_STATUS.STARTING && currentTimestamp < this.end_date) {
            //need to refund for participant
        }
        FormStorage.delete(this.id);
        UserFormStorage.delete(this.owner, this.id);
    }

    add_new_element(type: ElementType, title: string[], meta: Set<string>, isRequired: bool, numth: i32): Element | null {
        const sender = Context.sender;
        if (this.owner == sender && this.status == FORM_STATUS.EDITING) {
            this.nonce += 1;
            const newElement = new Element(type, title, meta, this.id, isRequired, this.nonce, numth);
            newElement.save();
            this.elements.add(newElement.get_id());
            this.save();
            // this.componentStorageFee = u128.add(this.componentStorageFee, newElement.get_storage_fee());
            // TODO: Them co che cho phep owner nap them tien vao de duy tri dich vu
            return newElement;
        }
        return null;
    }

    remove_element(id: string): bool {
        if (this.status != FORM_STATUS.EDITING) {
            return false;
        }

        if (this.elements.has(id)) {
            if (this.elements.delete(id)) {
                this.save();
                return true;
            }
        }

        return false;
    }

    unpublish(): bool {
        const currentTimestamp = Context.blockTimestamp / 1000000;
        if (this.status != FORM_STATUS.EDITING && currentTimestamp < this.end_date) {
            this.status = FORM_STATUS.EDITING;
            this.start_date = 0;
            this.end_date = 0;
            this.limit_participants = 0;
            BlackListStorage.deletes(this.id);
            WhiteListStorage.deletes(this.id);
            const participants = this.participants.values();
            const participant_length = participants.length;
            for (let i = 0; i < participant_length; i++) {
                const participant = UserStorage.get(participants[i]);
                if (participant != null) {
                    ContractPromiseBatch.create(participants[i]).transfer(this.enroll_fee);
                    // if(!promise) return false;
                    // TODO Handle list error
                    participant.remove_form_joined(this.id);
                }
            }
            this.enroll_fee = u128.Zero;
            this.participants.clear();
            this.save();
            return true;
        }
        return false;
    }

    join(): bool {
        const sender = Context.sender;

        if (!this.participants.has(sender)) {
            const is_in_white_list = WhiteListStorage.contains(this.id, sender);
            const is_in_black_list = BlackListStorage.contains(this.id, sender);

            if (!is_in_white_list || is_in_black_list) {
                return false;
            }

            const participants_length = this.participants.size;
            if (this.limit_participants > 0 && participants_length >= this.limit_participants) {
                return false;
            }

            this.participants.add(sender);

            const participant_form = new ParticipantForm(this.id);
            participant_form.save();
            this.save();

            return true;
        }

        return false;
    }

    submit_answer(userId: string, elementId: string, answers: Set<string>): bool {
        //need to join form first to create the necessary storage
        if (!this.participants.has(userId)) {
            return false;
        }

        const current_timestamp = Context.blockTimestamp / 1000000;
        if (current_timestamp < this.start_date || current_timestamp > this.end_date) {
            return false;
        }

        const participant_form_id = `${userId}_${this.id}`;

        const participant_form = ParticipantFormStorage.get(participant_form_id);

        if (participant_form == null) {
            return false;
        }

        const passed_element_existed = participant_form.contain_passed_element(elementId);

        if (this.isRetry || !passed_element_existed) {
            const newPassedElement = new PassedElement(elementId, answers);
            newPassedElement.save();

            participant_form.set_passed_element(elementId);
            participant_form.save();
            return true;
        } else {
            return false;
        }
    }

    toString(): string {
        return `{id: ${this.id}, owner: ${this.owner}, element: ${this.elements.values()}}`;
    }

    publish(limit_participants: i32, enroll_fee: u128, start_date: u64, end_date: u64, black_list: Set<string>, white_list: Set<string>): bool {
        if (this.status == FORM_STATUS.EDITING) {
            this.start_date = start_date;
            this.limit_participants = limit_participants;
            this.end_date = end_date;
            this.enroll_fee = enroll_fee;
            this.status = FORM_STATUS.STARTING;
            BlackListStorage.sets(this.id, black_list);
            WhiteListStorage.sets(this.id, white_list);
            this.save();
            return true;
        }
        return false;
    }

    get_answer(userId: string, page: i32): PaginationResult<UserAnswer> {
        const participant_form_id = `${userId}_${this.id}`;

        const participant_form = ParticipantFormStorage.get(participant_form_id);

        if (participant_form == null) {
            return new PaginationResult(1, 0, new Array<UserAnswer>(0));
        }

        const passed_element_keys = participant_form.get_passed_element_keys();
        const passed_element_keys_length = passed_element_keys.length;
        const result = new Set<UserAnswer>();
        const pagination_offset = getPaginationOffset(passed_element_keys_length, page);
        const start_index = pagination_offset.startIndex;
        const end_index = pagination_offset.endIndex;

        for (let i = start_index; i >= end_index; i--) {
            const passed_element_id = `${userId}_${passed_element_keys[i]}`;
            const passed_element = PassedElementStorage.get(passed_element_id);
            if (passed_element == null) {
                continue;
            }
            const element = ElementStorage.get(passed_element_keys[i]);
            if (element != null && element.get_type() != ElementType.HEADER && passed_element != null) {
                const element_title = element.get_title();
                const element_type = element.get_type();
                const passed_element_content = passed_element.get_content().values();
                const passed_element_submit_time = passed_element.get_submit_time();
                result.add(
                    new UserAnswer(
                        userId,
                        element.get_id(),
                        element_title,
                        element_type,
                        passed_element_content,
                        passed_element_submit_time,
                        element.get_numth(),
                        element.get_meta(),
                    ),
                );
            }
        }

        return new PaginationResult(page, passed_element_keys_length, result.values());
    }

    get_elements(): Element[] {
        const elements_size = this.elements.size;
        if (elements_size == 0) {
            return new Array<Element>(0);
        }

        const elements = this.elements.values();
        const ret = new Set<Element>();
        for (let i = 0; i < elements_size; i++) {
            const element = ElementStorage.get(elements[i]);
            if (element != null) {
                ret.add(element);
            }
        }

        return ret.values();
    }

    get_element(element_id: string): Element | null {
        return ElementStorage.get(element_id);
    }

    get_current_num_participants(): i32 {
        return this.participants.size;
    }
}

export default Form;
