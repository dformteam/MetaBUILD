import { PersistentUnorderedMap } from "near-sdk-as";
import Participant from "../model/participant.model";
import ParticipantForm from "../model/participant_form.model";

const participantFormPersit = new PersistentUnorderedMap<string, ParticipantForm>("pFP");
const participantDetailPersit = new PersistentUnorderedMap<string, Participant>("pDP");

export class ParticipantFormStorage {
    static get(id: string): ParticipantForm | null {
        if (participantFormPersit.contains(id)) {
            return participantFormPersit.getSome(id);
        }

        return null;
    }

    static set(id: string, value: ParticipantForm): void {
        participantFormPersit.set(id, value);
    }

    static contain(id: string): bool {
        return participantFormPersit.contains(id);
    }

    static delete(id: string): void {
        if (participantFormPersit.contains(id)) {
            participantFormPersit.delete(id);
        }
    }
}

export class ParticipantStorage {
    static get(id: string): Participant | null {
        if (participantDetailPersit.contains(id)) {
            return participantDetailPersit.getSome(id);
        }
        return null;
    }

    static set(id: string, value: Participant): void {
        participantDetailPersit.set(id, value);
    }

    static contains(id: string): bool {
        return participantDetailPersit.contains(id);
    }

    static delete(id: string): void {
        if (participantDetailPersit.contains(id)) {
            participantDetailPersit.delete(id);
        }
    }

    static count(): i32 {
        return participantDetailPersit.length;
    }
}
