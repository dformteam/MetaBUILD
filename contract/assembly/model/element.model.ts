import { base58, Context, util } from "near-sdk-core";
import { u128 } from "near-sdk-as";
import { eq_array } from "../helper/array";
import { ElementStorage } from "../storage/element.storage";
import Base from "./base.model";

export enum ElementType {
    HEADER,
    FULLNAME,
    EMAIL,
    ADDRESS,
    PHONE,
    DATE,
    FILL_IN_THE_BLANK,
    SHORT,
    LONG,
    SINGLE_CHOICE,
    MULTI_CHOICE,
    TIME,
    RATING,
    DATETIME,
}

@nearBindgen
class Element {
    private id: string;
    private owner: string;

    constructor(
        private type: ElementType,
        private title: string[],
        private meta: Set<string>,
        private formId: string,
        private isRequired: bool,
        private nonce: i32,
        private numth: i32,
    ) {
        this.owner = Context.sender;
        this.generate_id(formId);
    }

    private generate_id(formId: string): void {
        let elementId: string = "";
        const blockTime = `${this.owner}_${this.formId}_${this.nonce}`;
        const hBlockTime = base58.encode(util.stringToBytes(blockTime));
        elementId = hBlockTime;
        this.id = elementId;
    }

    get_id(): string {
        return this.id;
    }

    get_form_id(): string {
        return this.formId;
    }

    get_title(): string[] {
        return this.title;
    }

    get_owner(): string {
        return this.owner;
    }

    get_type(): ElementType {
        return this.type;
    }

    get_numth(): i32 {
        return this.numth;
    }

    set_title(newTitle: string[]): void {
        this.title = newTitle;
    }

    get_meta(): string[] {
        return this.meta.values();
    }

    set_meta(newMeta: Set<string>): void {
        this.meta = newMeta;
    }

    set_required(newRequired: bool): void {
        this.isRequired = newRequired;
    }

    toString(): string {
        return `{id: ${this.id}, owner: ${this.owner},q_counter: ${this.title}, title: ${this.title}, meta:${this.meta}}`;
    }

    save(): void {
        ElementStorage.set(this.id, this);
    }
}

export default Element;
