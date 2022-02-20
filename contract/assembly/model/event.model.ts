import { base58, Context, ContractPromiseBatch, logging, u128, util } from "near-sdk-as";
import { getPaginationOffset, PaginationResult } from "../helper/pagination.helper";
import { BlackListStorage } from "../storage/black_list.storage";
import { EventStorage, NewestEventStorage, UserEventStorage } from "../storage/event.storage";
import { FormStorage } from "../storage/form.storage";
import { UserStorage } from "../storage/user.storage";
import { WhiteListStorage } from "../storage/white_list.storage";

export enum EVENT_TYPE {
    ONLINE,
    INPERSON,
    ONLINE_AND_INPERSON,
}

export enum PUBLIC_PARTICIPANT_TYPE {
    INTERESTED,
    JOINED,
}

export enum EVENT_STATUS {
    EDITING,
    STARTING,
    ENDED,
}

const EVENT_DEFAULT_STORAGE_FEE = "100000000000000000000000"; // 0.1 NEAR
const EVENT_LIMITED_PARTICIPANT = 100000;

@nearBindgen
class Event {
    private id: string;
    private owner: string;
    private created_at: u64;
    private enroll_fee: u128;
    private participants: Set<string>;
    private interests: Set<string>;
    private limit_participants: i32;
    private register_start_date: u64;
    private register_end_date: u64;
    private status: EVENT_STATUS;
    constructor(
        private name: string,
        private location: string,
        private description: Set<string>,
        private privacy: Set<string>,
        private cover_image: string,
        private event_type: EVENT_TYPE,
        private start_date: u64,
        private end_date: u64,
        private url: string
    ) {
        this.created_at = Context.blockTimestamp / 1000000;
        this.owner = Context.sender;
        this.status = EVENT_STATUS.EDITING;
        this.enroll_fee = u128.Zero;

        if (this.participants == null) {
            this.participants = new Set<string>();
        }

        if (this.interests == null) {
            this.interests = new Set<string>();
        }

        this.generate_id();
    }

    set_name(value: string): Event {
        if (value !== "" && this.name !== value) {
            this.name = value;
        }

        return this;
    }

    set_description(value: Set<string>): Event {
        if (value.size > 0) {
            this.description = value;
        }
        return this;
    }

    set_location(value: string): Event {
        if (value !== "" && this.location !== value) {
            this.location = value;
        }

        return this;
    }

    set_cover_img(value: string): Event {
        if (value !== "" && this.cover_image !== value) {
            this.cover_image = value;
        }

        return this;
    }

    set_public_url(value: string): Event {
        if (value !== "" && this.url !== value) {
            this.url = value;
        }

        return this;
    }


    set_start_date(value: u64): Event {
        if (this.start_date !== value) {
            this.start_date = value;
        }

        return this;
    }

    set_end_date(value: u64): Event {
        if (this.end_date !== value) {
            this.end_date = value;
        }

        return this;
    }

    set_type(value: EVENT_TYPE): Event {
        if (this.event_type !== value) {
            this.event_type = value;
        }

        return this;
    }

    private generate_id(): void {
        let eventId: string = "";
        while (eventId == "") {
            const blockTime = "Event_" + Context.sender + Context.blockTimestamp.toString();
            const hBlockTime = base58.encode(util.stringToBytes(blockTime));
            if (!FormStorage.contains(hBlockTime)) {
                eventId = hBlockTime;
            }
        }
        this.id = eventId;
    }

    publish(limit_participants: i32, enroll_fee: u128, start_date: u64, end_date: u64, black_list: Set<string>, white_list: Set<string>): bool {
        if (this.status == EVENT_STATUS.EDITING) {
            this.register_start_date = start_date;
            this.register_end_date = end_date;
            this.limit_participants = limit_participants;
            this.enroll_fee = enroll_fee;
            this.status = EVENT_STATUS.STARTING;
            BlackListStorage.sets(this.id, black_list);
            WhiteListStorage.sets(this.id, white_list);
            NewestEventStorage.push(this.id);
            this.save();
            return true;
        }
        return false;
    }

    unpublish(): bool {
        const currentTimestamp = Context.blockTimestamp / 1000000;
        if (this.status != EVENT_STATUS.EDITING && currentTimestamp < this.register_end_date) {
            this.status = EVENT_STATUS.EDITING;
            this.register_start_date = 0;
            this.register_end_date = 0;
            this.limit_participants = 0;
            BlackListStorage.deletes(this.id);
            WhiteListStorage.deletes(this.id);
            const participants = this.participants.values();
            const participant_length = participants.length;
            for (let i = 0; i < participant_length; i++) {
                const user = UserStorage.get(participants[i]);
                if (user !== null) {
                    ContractPromiseBatch.create(participants[i]).transfer(this.enroll_fee);
                    user.remove_event_joined(this.id);
                }
            }
            this.enroll_fee = u128.Zero;
            this.participants.clear();
            this.save();
            return true;
        }
        return false;
    }

    public toString(): string {
        return `{id: ${this.id}, owner: ${this.owner}, description: ${this.description
            }, participants: ${this.participants.values()}, interests: ${this.interests.values()} }`;
    }

    get_id(): string {
        return this.id;
    }

    interest(): bool {
        const sender = Context.sender;
        if (!this.interests.has(sender)) {
            this.interests.add(sender);
            this.save();
            return true;
        }
        return false;
    }

    not_interest(): bool {
        const sender = Context.sender;
        if (this.interests.has(sender)) {
            this.interests.delete(sender);
            this.save();
            return true;
        }
        return false;
    }

    join(): bool {
        const sender = Context.sender;

        if (!this.participants.has(sender)) {
            const is_in_white_list = WhiteListStorage.contains(this.id, sender);
            const is_in_black_list = BlackListStorage.contains(this.id, sender);

            if (!is_in_white_list || is_in_black_list) {
                return false;
            }

            const participants_length = this.participants.size;
            if (this.limit_participants != 0 && participants_length >= this.limit_participants) {
                return false;
            }

            this.participants.add(sender);

            this.save();
            return true;
        }
        return false;
    }

    leave_event(): bool {
        const sender = Context.sender;
        const currentTimestamp = Context.blockTimestamp / 1000000;
        if (this.status === EVENT_STATUS.STARTING && currentTimestamp < this.register_end_date) {
            if (this.participants.has(sender)) {
                //TODO: need to refund
                const refund_amount = u128.div(u128.mul(this.enroll_fee, u128.from("90")), u128.from("100"));
                logging.log(refund_amount);
                ContractPromiseBatch.create(sender).transfer(refund_amount);
                this.participants.delete(sender);
                this.save();
                return true;
            }
        }

        return false;
    }

    get_name(): string {
        return this.name;
    }

    get_description(): Set<string> {
        return this.description;
    }

    get_cover_image(): string {
        return this.cover_image;
    }

    get_public_url(): string {
        return this.url;
    }

    get_number_of_participants(): i32 {
        return this.participants.size;
    }

    get_number_of_interests(): i32 {
        return this.interests.size;
    }

    get_location(): string {
        return this.location;
    }

    get_start_date(): u64 {
        return this.start_date;
    }

    get_end_date(): u64 {
        return this.end_date;
    }

    get_owner(): string {
        return this.owner;
    }

    get_enroll_fee(): u128 {
        return this.enroll_fee;
    }

    get_limit_participant(): i32 {
        return this.limit_participants;
    }

    get_status(): EVENT_STATUS {
        return this.status;
    }

    get_privacy(): Set<string> {
        return this.privacy;
    }

    get_type(): EVENT_TYPE {
        return this.event_type;
    }

    get_register_start_date(): u64 {
        return this.register_start_date;
    }

    get_register_end_date(): u64 {
        return this.register_end_date;
    }

    get_participants(page: i32): PaginationResult<string> {
        const participant = this.participants.values();
        const participant_length = participant.length;
        if (participant_length == 0) {
            return new PaginationResult(1, 0, new Array<string>(0));
        }
        const pagination_offset = getPaginationOffset(participant_length, page);
        const start_index = pagination_offset.startIndex;
        const end_index = pagination_offset.endIndex;
        const result = new Set<string>();

        for (let i = start_index; i >= end_index; i--) {
            result.add(participant[i]);
        }

        return new PaginationResult(page, participant_length, result.values());
    }

    remove(): void {
        const currentTimestamp = Context.blockTimestamp / 100000;
        if (this.status === EVENT_STATUS.STARTING && currentTimestamp < this.register_end_date) {
            // Need to refund to participant
        }
        EventStorage.delete(this.id);
        UserEventStorage.delete(this.owner, this.id);
    }

    save(): void {
        EventStorage.set(this.id, this);
        UserEventStorage.set(this.owner, this.id);
    }
}

export default Event;
