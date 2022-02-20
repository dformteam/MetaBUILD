import { Context } from "near-sdk-as";
import { PaginationResult } from "../helper/pagination.helper";
import { UserAnswer } from "../model/passed_element";
import { FormStorage } from "../storage/form.storage";
import { ParticipantFormStorage, ParticipantStorage } from "../storage/participant.storage";
import { ParticipantFormResponse } from "../model/response/participant_form";
import { ParticipantFormStatusResponse } from "../model/response/participant_form_status";
import { UserStorage } from "../storage/user.storage";

export function get_joined_forms(userId: string, page: i32): PaginationResult<ParticipantFormResponse> {
    const participant = UserStorage.get(userId);

    if (participant == null) {
        return new PaginationResult(1, 0, new Array<ParticipantFormResponse>(0));
    }

    return participant.get_joined_form(page);
}

export function get_joined_forms_count(userId: string): i32 {
    const participant = UserStorage.get(userId);

    if (participant == null) {
        return 0;
    }

    return participant.get_joined_form_count();
}

export function get_answer_statistical(userId: string, formId: string, page: i32): PaginationResult<UserAnswer> {
    const sender = Context.sender;
    const form = FormStorage.get(formId);
    if (form == null || (form.get_owner() != sender && userId != sender)) {
        return new PaginationResult(1, 0, new Array<UserAnswer>(0));
    }

    return form.get_answer(userId, page);
}

export function get_participant_form_status(userId: string, formId: string): ParticipantFormStatusResponse {
    const participant = UserStorage.get(userId);
    if (participant == null) {
        return new ParticipantFormStatusResponse(userId, formId, false);
    }

    return new ParticipantFormStatusResponse(userId, formId, participant.get_join_form_status(formId));
}

export function get_passed_element_count(userId: string, formId: string): i32 {
    const participant_form_id = `${userId}_${formId}`;
    const participant_form = ParticipantFormStorage.get(participant_form_id);
    if (participant_form == null) {
        return 0;
    }
    return participant_form.get_passed_element_count();
}

export function get_participants_count(): i32 {
    return UserStorage.count();
}
