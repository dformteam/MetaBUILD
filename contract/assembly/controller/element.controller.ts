import { Context, logging } from "near-sdk-core";
import { pagination, PaginationResult } from "../helper/pagination.helper";
import Question from "../model/element.model";
import { ElementType } from "../model/element.model";
import { ElementStorage } from "../storage/element.storage";
import { FormStorage } from "../storage/form.storage";

export function new_element(formId: string, type: ElementType, title: string[], meta: Set<string>, isRequired: bool, numth: i32): Question | null {
    if (title.length == 0 || title[0] == "") {
        return null;
    }

    const existedForm = FormStorage.get(formId);
    if (existedForm == null) {
        return null;
    }

    return existedForm.add_new_element(type, title, meta, isRequired, numth);
}

export function delete_element(formId: string, id: string): bool {
    const sender = Context.sender;
    const form = FormStorage.get(formId);

    if (form == null) {
        return false;
    }

    if (form.get_owner() != sender) {
        return false;
    }

    return form.remove_element(id);
}

export function update_element(formId: string, id: string, title: string[], meta: Set<string>, isRequired: bool): Question | null {
    const sender = Context.sender;
    const form = FormStorage.get(formId);

    if (form == null) {
        return null;
    }

    if (form.get_owner() != sender) {
        return null;
    }

    if (!form.has_element(id)) {
        return null;
    }

    const element = ElementStorage.get(id);

    if (element == null) {
        return null;
    }

    element.set_title(title);
    element.set_meta(meta);
    element.set_required(isRequired);
    element.save();
    return element;
}

export function get_element(userId: string, formId: string): Question | null {
    const form = FormStorage.get(formId);
    if (form == null) {
        return null;
    }
    return form.get_next_element(userId);
}

export function get_element_count(formId: string): i32 {
    const form = FormStorage.get(formId);
    if (form == null) {
        return 0;
    }
    return form.get_max_element();
}

export function get_elements(userId: string, formId: string, page: i32): PaginationResult<Question> {
    const form = FormStorage.get(formId);
    if (form == null) {
        return new PaginationResult(1, 0, new Array<Question>(0));
    }

    if (form.has_participant(userId) || form.get_owner() == userId) {
        const elements = form.get_elements();
        return pagination<Question>(elements, page);
    }

    return new PaginationResult(1, 0, new Array<Question>(0));
}
