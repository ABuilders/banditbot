/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 19:12:25
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 14:53:54
 */

import { BanditEvents, EventBody, Registry } from "../../typings";

export function useEvent<Key extends keyof BanditEvents>(body: EventBody<Key>): Registry<EventBody<Key>> {
    if (!body) throw new Error("Event body is null!");
    return body;
}