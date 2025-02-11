/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 19:11:18
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-10 21:59:23
 */

import { ActivityType } from "discord.js";
import { BanditEngine } from "../BanditEngine";
import { useEvent } from "../structures/bases/Event";
import { createActivity } from "../structures/Utils";
import { isDevelopmentEnvironment, RESTify } from "../structures";

const ReadyEvent = useEvent<"ready">({
    name: "ready",
    callback: async () =>
    {
        const engine = BanditEngine.createEngine();
        const client = engine.getClient(true);

        // RESTify
        await RESTify.restify(client, client.getCommandJSONArray(), isDevelopmentEnvironment() ? {
            guildId: process.env.DevelopmentGuildId!
        } : undefined);
        
        await client.getClientUser(true).setPresence({
            activities: [
                createActivity("Bandit Servers", ActivityType.Watching)
            ]
        });
    }
})

export default  ReadyEvent;