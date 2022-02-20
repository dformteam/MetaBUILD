import { Context, u128 } from "near-sdk-core";
import { PaginationResult } from "../helper/pagination.helper";
import { EVENT_TYPE } from "../model/event.model";
import Event from "../model/event.model";
import EventDetailResponse from "../model/response/event_detail_response";
import { EventStorage, NewestEventStorage, UserEventStorage, UserInterestedEventStorage } from "../storage/event.storage";

export function get_event(eventId: string): EventDetailResponse | null {
    const event = EventStorage.get(eventId);
    if (event == null) {
        return null;
    }
    return new EventDetailResponse(
        event.get_id(),
        event.get_owner(),
        event.get_name(),
        event.get_description(),
        event.get_privacy(),
        event.get_enroll_fee(),
        event.get_number_of_participants(),
        event.get_limit_participant(),
        event.get_start_date(),
        event.get_end_date(),
        event.get_location(),
        event.get_cover_image(),
        event.get_status(),
        event.get_type(),
        event.get_register_start_date(),
        event.get_register_end_date(),
        event.get_public_url(),
    );
}

export function get_events(userId: string, page: i32): PaginationResult<Event> {
    return UserEventStorage.gets(userId, page);
}


export function update_event_info(
    eventId: string,
    title: string,
    description: Set<string>,
    location: string,
    cover_img: string,
    start_date: u64,
    end_date: u64,
    type: EVENT_TYPE,
    url: string
): Event | null {
    const event = EventStorage.get(eventId);
    if (event == null) {
        return null;
    }

    event
        .set_name(title)
        .set_description(description)
        .set_location(location)
        .set_cover_img(cover_img)
        .set_start_date(start_date)
        .set_end_date(end_date)
        .set_type(type)
        .set_public_url(url)
        .save();

    return event;
}

export function get_enroll_fee(eventId: string): u128 | null {
    const event = EventStorage.get(eventId);
    if (event == null) {
        return null;
    }

    return event.get_enroll_fee();
}

export function get_event_count(userId: string): i32 {
    return UserEventStorage.count(userId);
}

export function get_interested_event_count(userId: string): i32 {
    return UserInterestedEventStorage.count(userId);
}

export function get_participants(eventId: string, page: i32): PaginationResult<string> {
    const event = EventStorage.get(eventId);
    if (event == null) {
        return new PaginationResult(1, 0, new Array<string>(0));
    }

    return event.get_participants(page);
}

export function get_participants_count(eventId: string): i32 {
    const event = EventStorage.get(eventId);
    if (event == null) {
        return 0;
    }

    return event.get_number_of_participants();
}

export function get_interests_count(eventId: string): i32 {
    const event = EventStorage.get(eventId);
    if (event == null) {
        return 0;
    }
    return event.get_number_of_interests();
}

export function delete_event(id: string): bool {
    const sender = Context.sender;
    const existedEvent = EventStorage.get(id);

    if (existedEvent == null || existedEvent.get_owner() != sender) {
        return false;
    }

    existedEvent.remove();
    return true;
}

export function interest_event(eventId: string): string | null {
    const event = EventStorage.get(eventId);
    const sender = Context.sender;
    if (event == null) {
        return null;
    }
    if (event.interest()) {
        UserInterestedEventStorage.set(sender, eventId);
        return 'Interested';
    } else if (event.not_interest()) {
        UserInterestedEventStorage.delete(sender, eventId);
        return 'Disinterested'
    } else {
        return null;
    }
}

export function get_interested_events(userId: string, page: i32): PaginationResult<Event> {
    return UserInterestedEventStorage.gets(userId, page);
}

// export function not_interest_event(eventId: string): bool {
//     const event = EventStorage.get(eventId);

//     if (event == null) {
//         return false;
//     }

//     return event.not_interest();
// }

export function publish_event(
    eventId: string,
    limit_participants: i32,
    enroll_fee: u128,
    start_date: u64,
    end_date: u64,
    black_list: Set<string>,
    white_list: Set<string>,
): bool {
    const existedEvent = EventStorage.get(eventId);
    if (existedEvent == null) {
        return false;
    }
    return existedEvent.publish(limit_participants, enroll_fee, start_date, end_date, black_list, white_list);
}

export function unpublish_event(eventId: string): bool {
    const existedEvent = EventStorage.get(eventId);
    const sender = Context.sender;
    if (existedEvent == null || existedEvent.get_owner() != sender) {
        return false;
    }

    return existedEvent.unpublish();
}

export function get_newest_events(): PaginationResult<Event> {
    return NewestEventStorage.gets();
}