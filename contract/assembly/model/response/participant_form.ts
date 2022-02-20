import { FORM_TYPE } from "../form.model";

@nearBindgen
export class ParticipantFormResponse {
    constructor(
        private user_id: string,
        private form_id: string,
        private form_title: string,
        private passed_question: i32,
        private form_type: FORM_TYPE,
        private last_summited: u64,
    ) {}

    toString(): string {
        return `${this.user_id} --- ${this.form_id} --- ${this.form_title} --- ${this.passed_question}`;
    }
}
