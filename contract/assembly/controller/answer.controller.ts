import { Context } from "near-sdk-core";
import { FormStorage } from "../storage/form.storage";

export function submit_answer(formId: string, elementId: string, answer: Set<string>): bool {
    const sender = Context.sender;
    const form = FormStorage.get(formId);
    if (form == null) {
        return false;
    }

    const submit_result = form.submit_answer(sender, elementId, answer);
    return submit_result;
}
