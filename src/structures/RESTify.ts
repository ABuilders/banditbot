import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { BanditClient } from "../BanditClient";
import { ExceptionalLogger } from "./ExceptionalLogger";

export interface OptionalGuildOnly {
    guildId: string;
}

export class RESTify {

    static async restify(client: BanditClient, commands: RESTPostAPIChatInputApplicationCommandsJSONBody[], options?: OptionalGuildOnly) {

        const rest = new REST({ version: "10" }).setToken(client.getOptions().token || "");

        try {
            ExceptionalLogger.getInstance().info("RESTifying application commands for " + (options ? "Guild-use only." : "Global use."))
            await rest.put(
                options 
                ? Routes.applicationGuildCommands(client.getClientUser(true).id, options.guildId)
                : Routes.applicationCommands(client.getClientUser(true).id),
                {
                    body: commands
                }
            )
            ExceptionalLogger.getInstance().info("RESTified " + (commands.length) + " amount of commands!")
        } catch (err) {
            ExceptionalLogger.getInstance().throw(err as Error);
        }
        
    }

}