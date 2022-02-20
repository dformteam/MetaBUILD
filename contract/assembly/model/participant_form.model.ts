import { Context, u128 } from "near-sdk-as";
import { ElementStorage } from "../storage/element.storage";
import { ParticipantFormStorage } from "../storage/participant.storage";
import Base from "./base.model";
import { ElementType } from "./element.model";

@nearBindgen
class ParticipantForm {
    private id: string;
    private lastSubmitTimestamp: u64;
    private cashSpent: u128 = u128.from(0);
    private submitTimes: u32 = 0;
    private passed_element: Set<string>;

    constructor(private formId: string) {
        if (this.passed_element == null) {
            this.passed_element = new Set<string>();
        }
        this.generate_id();
    }

    generate_id(): void {
        const sender = Context.sender;
        this.id = `${sender}_${this.formId}`;
    }

    set_passed_element(id: string): void {
        this.lastSubmitTimestamp = Context.blockTimestamp / 1000000;
        this.submitTimes = this.submitTimes + 1;
        this.passed_element.add(id);
    }

    get_passed_element_keys(): string[] {
        if (this.passed_element == null) {
            return new Array<string>(0);
        }

        return this.passed_element.values();
    }

    get_passed_element_count(): i32 {
        return this.passed_element.size;
    }

    get_last_submited(): u64 {
        return this.lastSubmitTimestamp;
    }

    get_passed_question(): i32 {
        return this.passed_element.size;
    }

    contain_passed_element(id: string): bool {
        return this.passed_element.has(id);
    }

    toString(): string {
        return `{id: ${this.id}, lastSubmitTimestamp: ${this.lastSubmitTimestamp}, cashSpent: ${this.cashSpent}, submitTimes: ${this.submitTimes}, passed_element: ${this.passed_element}}`;
    }

    save(): void {
        ParticipantFormStorage.set(this.id, this);
    }
}

export default ParticipantForm;
