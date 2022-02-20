import { Context, logging, u128 } from "near-sdk-core";
import { ParticipantFormStorage, ParticipantStorage } from "../storage/participant.storage";
import { getPaginationOffset, PaginationResult } from "../helper/pagination.helper";
import { FormStorage } from "../storage/form.storage";
import { ParticipantFormResponse } from "../model/response/participant_form";
import Base from "./base.model";

export enum ParticipantStatus {
    Banned,
    Active,
    Error,
}

@nearBindgen
class Participant {
    private id: string;
    private status: ParticipantStatus = ParticipantStatus.Active;
    private forms: Set<string>;

    constructor() {
        this.id = Context.sender;
        if (this.forms == null) {
            this.forms = new Set<string>();
        }
        this.save();
    }

    set_status(status: ParticipantStatus): void {
        this.status = status;
    }

    get_status(): ParticipantStatus {
        return this.status;
    }

    join_form(formId: string): void {
        this.forms.add(formId);
    }

    get_join_form_status(formId: string): bool {
        return this.forms.has(formId);
    }

    get_joined_form(page: i32): PaginationResult<ParticipantFormResponse> {
        const forms = this.forms.values();
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
        return this.forms.size;
    }

    remove_form(form_id: string): void {
        if (this.forms.has(form_id)) {
            this.forms.delete(form_id);
            const participant_form_id = `${this.id}_${form_id}`;
            ParticipantFormStorage.delete(participant_form_id);
            this.save();
        }
    }
    // join(): u64 {
    //     this.lastSubmitTimestamp = Context.blockTimestamp;
    //     this.submitTimes = this.submitTimes + 1;
    //     this.cashSpent = u128.add(this.cashSpent, Context.attachedDeposit);
    //     this.save();
    //     return this.lastSubmitTimestamp;
    // }

    toString(): string {
        return `{id: ${this.id}, status: ${this.status}, forms: ${this.forms}}`;
    }

    save(): void {
        ParticipantStorage.set(this.id, this);
    }
}

export default Participant;
