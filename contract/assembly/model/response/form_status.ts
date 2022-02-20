import { FORM_STATUS } from "../form.model";

@nearBindgen
export class FormStatusResponse {
    constructor(private id: string, private owner: string, private status: FORM_STATUS) {}
}
