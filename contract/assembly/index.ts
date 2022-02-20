import * as Form from "./controller/form.controller";
import * as Question from "./controller/element.controller";
import * as Answer from "./controller/answer.controller";
import * as Participant from "./controller/participant.controller";
import * as Event from "./controller/event.controller";
import * as User from "./controller/user.controller";

import { logging, u128 } from "near-sdk-as";
import { PaginationResult } from "./helper/pagination.helper";
import FormModel from "./model/form.model";
import { FORM_TYPE } from "./model/form.model";
import QuestionModel from "./model/element.model";
import { ElementType } from "./model/element.model";
import { UserAnswer } from "./model/passed_element";
import { ParticipantFormResponse } from "./model/response/participant_form";
import { FormStatusResponse } from "./model/response/form_status";
import { EVENT_TYPE } from "./model/event.model";
import EventModel from "./model/event.model";
import { ParticipantFormStatusResponse } from "./model/response/participant_form_status";
import UserModel from "./model/user.model";
import EventDetailResponse from "./model/response/event_detail_response";
import UserDetailResponse from "./model/response/user_detail_response";

//USER

export function init_new_form(title: string, description: string, type: FORM_TYPE): string | null {
    return User.init_new_form(title, description, type);
}

export function join_form(formId: string): bool {
    return User.join_form(formId);
}

export function delete_form(id: string): bool {
    return User.delete_form(id);
}

export function init_new_event(
    title: string,
    location: string,
    description: Set<string>,
    privacy: Set<string>,
    cover_image: string,
    type: EVENT_TYPE,
    start_date: u64,
    end_date: u64,
    url: string
): string | null {
    return User.init_new_event(title, location, description, privacy, cover_image, type, start_date, end_date, url);
}
// TODO Check function loi khi dat vao view
 
export function get_recent_event_created(): string | null {
    return User.get_recent_event_created();
}

export function join_event(eventId: string): bool {
    return User.join_event(eventId);
}

export function leave_event(eventId: string): bool {
    return User.leave_event(eventId);
}

export function get_user(userId: string): UserDetailResponse | null {
    return User.get_user(userId);
}

// FORM

export function get_form(id: string): FormModel | null {
    return Form.get_form(id);
}

export function publish_form(
    formId: string,
    limit_participants: i32,
    enroll_fee: u128,
    start_date: u64,
    end_date: u64,
    black_list: Set<string>,
    white_list: Set<string>,
): bool {
    return Form.publish_form(formId, limit_participants, enroll_fee, start_date, end_date, black_list, white_list);
}

export function unpublish_form(formId: string): bool {
    return Form.unpublish_form(formId);
}

export function get_forms(userId: string, page: i32): PaginationResult<FormModel> {
    return Form.get_forms(userId, page);
}

export function get_joined_forms(userId: string, page: i32): PaginationResult<ParticipantFormResponse> {
    return Participant.get_joined_forms(userId, page);
}

export function get_joined_forms_count(userId: string): i32 {
    return Participant.get_joined_forms_count(userId);
}

export function new_element(formId: string, type: ElementType, title: string[], meta: Set<string>, isRequired: bool, numth: i32): QuestionModel | null {
    return Question.new_element(formId, type, title, meta, isRequired, numth);
}

export function delete_element(formId: string, id: string): bool {
    return Question.delete_element(formId, id);
}

export function get_element(userId: string, formId: string): QuestionModel | null {
    return Question.get_element(userId, formId);
}

export function get_elements(userId: string, formId: string, page: i32): PaginationResult<QuestionModel> {
    return Question.get_elements(userId, formId, page);
}

export function get_element_count(formId: string): i32 {
    return Question.get_element_count(formId);
}

export function get_form_count(userId: string): i32 {
    return Form.get_form_count(userId);
}

export function get_form_status(formId: string): FormStatusResponse {
    return Form.get_form_status(formId);
}

export function submit_answer(formId: string, elementId: string, answer: Set<string>): bool {
    return Answer.submit_answer(formId, elementId, answer);
}

export function update_element(formId: string, id: string, title: string[], meta: Set<string>, isRequired: bool): QuestionModel | null {
    return Question.update_element(formId, id, title, meta, isRequired);
}

export function update_form(id: string, title: string, description: string): FormModel | null {
    return Form.update_form(id, title, description);
}

export function get_answer_statistical(userId: string, formId: string, page: i32): PaginationResult<UserAnswer> {
    return Participant.get_answer_statistical(userId, formId, page);
}

export function get_participant_form_status(userId: string, formId: string): ParticipantFormStatusResponse {
    return Participant.get_participant_form_status(userId, formId);
}

export function test(title: Set<string>): void {
    logging.log(title.values());
}

export function get_event(eventId: string): EventDetailResponse | null {
    return Event.get_event(eventId);
}

export function get_events(userId: string, page: i32): PaginationResult<EventModel> {
    return Event.get_events(userId, page);
}

export function get_newest_events(): PaginationResult<EventModel> {
    return Event.get_newest_events();
}

export function get_event_count(userId: string): i32 {
    return Event.get_event_count(userId);
}

export function get_interested_event_count(userId: string): i32 {
    return Event.get_interested_event_count(userId);
}

export function update_event_info(
    eventId: string,
    title: string,
    description: Set<string>,
    location: string,
    cover_img: string,
    start_date: u64,
    end_date: u64,
    type: EVENT_TYPE,
    url: string
): EventModel | null {
    return Event.update_event_info(eventId, title, description, location, cover_img, start_date, end_date, type, url);
}

export function publish_event(
    eventId: string,
    limit_participants: i32,
    enroll_fee: u128,
    start_date: u64,
    end_date: u64,
    black_list: Set<string>,
    white_list: Set<string>,
): bool {
    return Event.publish_event(eventId, limit_participants, enroll_fee, start_date, end_date, black_list, white_list);
}

export function get_interests_count(eventId: string): i32 {
    return Event.get_interests_count(eventId);
}

export function get_participants_count(eventId: string): i32 {
    return Event.get_participants_count(eventId);
}

export function delete_event(eventId: string): bool {
    return Event.delete_event(eventId);
}

export function interest_event(eventId: string): string | null {
    return Event.interest_event(eventId);
}

// export function not_interest_event(eventId: string): bool {
//     return Event.not_interest_event(eventId);
// }

export function get_interested_events(userId: string, page: i32): PaginationResult<EventModel> {
    return Event.get_interested_events(userId, page);
}

export function get_passed_element_count(userId: string, formId: string): i32 {
    return Participant.get_passed_element_count(userId, formId);
}

export function get_forms_count(): i32 {
    return Form.get_forms_count();
}

export function claim_reward(formId: string): u128 {
    return Form.claim_reward(formId);
}

export function unpublish_event(eventId: string): bool {
    return Event.unpublish_event(eventId);
}

export function get_event_participants(eventId: string, page: i32): PaginationResult<string> {
    return Event.get_participants(eventId, page);
}
