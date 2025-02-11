/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 17:32:24
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-11 20:49:13
 */

import { config } from "dotenv";
import * as Bandit from "../src";
import ReadyEvent from "../src/events/ReadyEvent";

config();

async function main()
{
    try
    {
        console.log(process.argv.join(`, `));
        const banditEngine = Bandit.BanditEngine.createEngine();
        const banditClient = banditEngine.createClient({
            intents: [
                Bandit.GatewayIntentBits.Guilds,         // Required to interact with guilds
                Bandit.GatewayIntentBits.GuildMessages,  // Required to receive messages in guilds
                Bandit.GatewayIntentBits.MessageContent  // Required to read message content
            ],
            token: process.env.DiscordToken!
        });

        banditClient.useInitialize(() => {
           
            banditEngine.createDatabase();
            banditEngine.useHandler(Bandit.CommandHandler).loadCommands();
            banditEngine.useHandler(Bandit.EventHandler).loadEvents();
            banditEngine.useEventRegistry(
                (registry) =>
                    registry
                        .add(ReadyEvent)
            );

        });

        await banditEngine.startClient();
        Bandit.ExceptionalLogger.getInstance().info("Logged in to client successfully!");
    } catch (ex)
    {
        Bandit.ExceptionalLogger.getInstance().throw((ex as Error));
    }
}

main().catch((err: Error) =>
{
    Bandit.ExceptionalLogger.getInstance().throw(err);
})