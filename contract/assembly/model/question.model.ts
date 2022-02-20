import { base58, Context, util } from "near-sdk-core";

export enum QuestionType {
    YESNO,
    ONCE,
    MANY,
    FILL,
}

@nearBindgen
class Question {
    private id: string;
    private owner: string;
    constructor(private type: QuestionType, private title: string, private meta: string, private formId: string, private isRequired: bool) {
        this.owner = Context.sender;
        this.generate_id(formId);
    }

    private generate_id(formId: string): void {
        let elementId: string = "";
        while (elementId == "") {
            const blockTime = formId + Context.blockTimestamp.toString();
            const hBlockTime = base58.encode(util.stringToBytes(blockTime));
            elementId = hBlockTime;
        }
        this.id = elementId;
    }

    get_id(): string {
        return this.id;
    }

    getFormId(): string {
        return this.formId;
    }

    get_title(): string {
        return this.title;
    }

    get_owner(): string {
        return this.owner;
    }

    get_type(): QuestionType {
        return this.type;
    }

    set_title(newTitle: string): void {
        if (newTitle != "" && newTitle != null && newTitle != this.title) {
            this.title = newTitle;
        }
    }

    set_meta(newMeta: string): void {
        if (newMeta != "" && newMeta != null && newMeta != this.meta) {
            this.meta = newMeta;
        }
    }

    toString(): string {
        return `{id: ${this.id}, owner: ${this.owner},q_counter: ${this.title}, title: ${this.title}, meta:${this.meta}}`;
    }
}

export default Question;
