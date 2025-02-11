import { BanditEvents, EventBody, Registry } from "../../typings";

export function useEvent<Key extends keyof BanditEvents>(body: EventBody<Key>): Registry<EventBody<Key>> {
    if (!body) throw new Error("Event body is null!");
    return body;
}