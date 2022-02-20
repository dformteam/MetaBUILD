import { PersistentUnorderedMap, PersistentVector } from "near-sdk-as";
import { getPaginationOffset, PaginationResult } from "../helper/pagination.helper";
import Form from "../model/form.model";

const userFormPersit = new PersistentUnorderedMap<string, string>("uFP");
const formPersit = new PersistentUnorderedMap<string, Form>("fP");
const formAnalysis = new PersistentUnorderedMap<string, PersistentVector<string>>("fA");
export class FormStorage {
    static get(id: string): Form | null {
        if (formPersit.contains(id)) {
            return formPersit.getSome(id);
        }
        return null;
    }

    static set(id: string, value: Form): void {
        formPersit.set(id, value);
    }

    static gets(): Form[] {
        return formPersit.values();
    }

    static contains(id: string): bool {
        return formPersit.contains(id);
    }

    static delete(id: string): void {
        formPersit.delete(id);
    }

    static count(): i32 {
        return formPersit.length;
    }
}

export class FormAnalysistStorage {
    static get(id: string): PersistentVector<string> | null {
        if (formAnalysis.contains(id)) {
            return formAnalysis.getSome(id);
        }
        return null;
    }

    static add(formId: string, participantID: string): void {
        formAnalysis.getSome(formId).push(participantID);
        const ls_part: PersistentVector<string> = formAnalysis.getSome(formId);
        formAnalysis.set(formId, ls_part);
    }

    static set(formId: string, value: PersistentVector<string> = new PersistentVector<string>(formId)): void {
        formAnalysis.set(formId, value);
    }

    static contains(formId: string): bool {
        return formAnalysis.contains(formId);
    }

    static delete(formId: string): void {
        formAnalysis.delete(formId);
    }
}

export class UserFormStorage {
    static gets(id: string, page: i32): PaginationResult<Form> {
        if (userFormPersit.contains(id)) {
            const formIdSerialize = userFormPersit.getSome(id);
            if (formIdSerialize == "" || formIdSerialize == null) {
                return new PaginationResult<Form>(1, 0, new Array<Form>(0));
            }

            const formIds = formIdSerialize.split(",");
            const formSize = formIds.length;
            const pagination_offset = getPaginationOffset(formSize, page);
            const ret: Set<Form> = new Set<Form>();

            for (let i = pagination_offset.startIndex; i >= pagination_offset.endIndex; i--) {
                if (formPersit.contains(formIds[i])) {
                    const formDetails = formPersit.getSome(formIds[i]);
                    ret.add(formDetails);
                }
            }
            return new PaginationResult<Form>(page, formSize, ret.values());
        }

        return new PaginationResult<Form>(1, 0, new Array<Form>(0));
    }

    static set(userId: string, formId: string): void {
        if (userFormPersit.contains(userId)) {
            let formIdSerialize = userFormPersit.getSome(userId);
            if (formIdSerialize == "" || formIdSerialize == null) {
                formIdSerialize = "";
            }
            let formIds = formIdSerialize.split(",");
            const fIndex = formIds.indexOf(formId);
            if (fIndex == -1) {
                formIds.push(formId);
                formIdSerialize = formIds.join(",");
                userFormPersit.set(userId, formIdSerialize);
            }
        } else {
            userFormPersit.set(userId, formId);
        }
    }

    static count(userId: string): i32 {
        if (userFormPersit.contains(userId)) {
            const formIdSerialize = userFormPersit.getSome(userId);
            if (formIdSerialize == "" || formIdSerialize == null) {
                return 0;
            }
            const formIds = formIdSerialize.split(",");
            const formIdLengths = formIds.length;
            let num = 0;
            for (let i = 0; i < formIdLengths; i++) {
                if (formIds[i] != "") {
                    num++;
                }
            }
            return num;
        }
        return 0;
    }

    static delete(userId: string, formId: string): void {
        if (userFormPersit.contains(userId)) {
            let formIdSerialize = userFormPersit.getSome(userId);

            if (formIdSerialize == "" || formIdSerialize == null) {
                formIdSerialize = "";
            }
            let formIds = formIdSerialize.split(",");
            const dIndex = formIds.indexOf(formId);
            if (dIndex > -1) {
                formIds.splice(dIndex, 1);
            }
            formIdSerialize = formIds.join(",");
            userFormPersit.set(userId, formIdSerialize);
        }
    }
}
