import { logging, PersistentUnorderedMap } from "near-sdk-as";
import User from "../model/user.model";

const userPersist = new PersistentUnorderedMap<string, User>("uP");

export class UserStorage {
    static get(id: string): User | null {
        if (userPersist.contains(id)) {
            return userPersist.getSome(id);
        }
        return null;
    }

    static set(id: string, value: User): void {
        userPersist.set(id, value);
    }

    static contains(id: string): bool {
        return userPersist.contains(id);
    }

    static delete(id: string): void {
        if (userPersist.contains(id)) {
            userPersist.delete(id);
        }
    }

    static count(): i32 {
        return userPersist.length;
    }
}
