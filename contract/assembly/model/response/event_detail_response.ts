import { u128 } from "near-sdk-as";
import { EVENT_STATUS, EVENT_TYPE } from "../event.model";

@nearBindgen
class EventDetailResponse {
    constructor(
        private id: string,
        private owner: string,
        private title: string,
        private description: Set<string>,
        private privacy: Set<string>,
        private enroll_fee: u128,
        private participants: i32,
        private limit_participants: i32,
        private start_date: u64,
        private end_date: u64,
        private location: string,
        private cover_img: string,
        private status: EVENT_STATUS,
        private type: EVENT_TYPE,
        private reg_start_date: u64,
        private reg_end_date: u64,
        private url: string,
    ) {}
}

export default EventDetailResponse;
