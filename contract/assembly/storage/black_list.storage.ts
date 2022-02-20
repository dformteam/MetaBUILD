import { PersistentUnorderedMap } from "near-sdk-as";

// const blackListPersit = new PersistentUnorderedMap<string, string>("bLP");
const blackListPersit = new PersistentUnorderedMap<string, Set<string>>("blP");

export class BlackListStorage {
    static get(id: string): string[] {
        if (blackListPersit.contains(id)) {
            let black_lists = blackListPersit.getSome(id);
            return black_lists.values();
        }
        return new Array<string>(0);
    }

    static set(id: string, value: string): void {
        if (blackListPersit.contains(id)) {
            let black_lists = blackListPersit.getSome(id);
            black_lists.add(value);

            blackListPersit.set(id, black_lists);
            // const black_lists = black_list_serialized.split(";");
            // const uIndex = black_lists.indexOf(value);
            // if (uIndex != -1) {
            //     black_lists.push(value);
            //     black_list_serialized = black_lists.join(";");

            // }
        } else {
            let black_lists = new Set<string>();
            black_lists.add(value);
            blackListPersit.set(id, black_lists);
        }
    }

    static sets(id: string, value: Set<string>): void {
        blackListPersit.set(id, value);
    }

    static contains(id: string, value: string): bool {
        if (blackListPersit.contains(id)) {
            let black_list = blackListPersit.getSome(id);

            return black_list.has(value);
        }
        return false;
    }

    static delete(id: string, value: string): void {
        if (blackListPersit.contains(id)) {
            let black_list = blackListPersit.getSome(id);

            black_list.delete(value);

            // const black_lists = black_list_serialized.split(";");
            // const uIndex = black_lists.indexOf(value);
            // if (uIndex != -1) {
            //     black_lists.splice(uIndex, 1);
            //     black_list_serialized = black_lists.join(";");
            //     blackListPersit.set(id, black_list_serialized);
            // }
        }
    }

    static deletes(id: string): void {
        if (blackListPersit.contains(id)) {
            blackListPersit.delete(id);
        }
    }
}
