import { PersistentMap } from "near-sdk-as";
import Element from "../model/element.model";

const elementStorage = new PersistentMap<string, Element>("eSP");

export class ElementStorage {
    static get(id: string): Element | null {
        if (elementStorage.contains(id)) {
            return elementStorage.getSome(id);
        }

        return null;
    }

    static set(id: string, value: Element): void {
        elementStorage.set(id, value);
    }

    static contain(id: string): bool {
        return elementStorage.contains(id);
    }

    static delete(id: string): void {
        if (elementStorage.contains(id)) {
            elementStorage.delete(id);
        }
    }
}
