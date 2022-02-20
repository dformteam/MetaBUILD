import { PersistentUnorderedMap } from "near-sdk-as";

// const whiteListPersit = new PersistentUnorderedMap<string, string>("bLP");
const whiteListPersit = new PersistentUnorderedMap<string, Set<string>>("bLP");

export class WhiteListStorage {
    static get(id: string): string[] {
        if (whiteListPersit.contains(id)) {
            let white_lists = whiteListPersit.getSome(id);

            return white_lists.values();
            // if (white_list_serialized == "") {
            //     return new Array<string>(0);
            // }
        }
        return new Array<string>(0);
    }

    static set(id: string, value: string): void {
        if (whiteListPersit.contains(id)) {
            let white_list = whiteListPersit.getSome(id);
            white_list.add(value);

            whiteListPersit.set(id, white_list);
            // const white_lists = white_list_serialized.split(";");
            // const uIndex = white_lists.indexOf(value);
            // if (uIndex != -1) {
            //     white_lists.push(value);
            //     white_list_serialized = white_lists.join(";");
            //     whiteListPersit.set(id, white_list_serialized);
            // }
        } else {
            let white_list = new Set<string>();
            white_list.add(value);
            whiteListPersit.set(id, white_list);
        }
    }

    static sets(id: string, value: Set<string>): void {
        whiteListPersit.set(id, value);
    }

    static contains(id: string, value: string): bool {
        if (whiteListPersit.contains(id)) {
            let white_list = whiteListPersit.getSome(id);
            if (white_list.size == 0) {
                return true;
            }

            return white_list.has(value);

            // if (white_list_serialized == "") {
            //     return true;
            // }

            // const white_lists = white_list_serialized.split(";");
            // const uIndex = white_lists.indexOf(value);
            // if (uIndex != -1) {
            //     return false;
            // }
        }
        return true;
    }

    static delete(id: string, value: string): void {
        if (whiteListPersit.contains(id)) {
            let white_lists = whiteListPersit.getSome(id);

            white_lists.delete(value);
            // const white_lists = white_list_serialized.split(";");
            // const uIndex = white_lists.indexOf(value);
            // if (uIndex != -1) {
            //     white_lists.splice(uIndex, 1);
            //     white_list_serialized = white_lists.join(";");
            //     whiteListPersit.set(id, white_list_serialized);
            // }
        }
    }

    static deletes(id: string): void {
        if (whiteListPersit.contains(id)) {
            whiteListPersit.delete(id);
        }
    }
}
