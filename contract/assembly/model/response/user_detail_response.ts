import { u128 } from "near-sdk-as";
import { USER_STATUS } from "../user.model";

@nearBindgen
class UserDetailResponse {
    constructor(
        private id: string,
        private status: USER_STATUS,
        private income: u128,
        private outcome: u128,
        private forms_owner: i32,
        private events_owner: i32,
        private forms_joined: i32,
        private events_joined: i32,
    ) {}
}

export default UserDetailResponse;
