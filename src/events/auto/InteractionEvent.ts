import { Interaction } from "discord.js";
import { ExceptionalLogger, useEvent } from "../../structures";
import { BanditEngine } from "../../BanditEngine";

export default useEvent<"interactionCreate">({
    name: "interactionCreate",
    callback: async (interaction: Interaction) =>
    {

        if (!interaction.isCommand() || !interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;

        const { commandName } = interaction;
        const engine = BanditEngine.createEngine();
        const client = engine.getClient(true);
        const commandMap = client.getCommandMap();
        const commandError = async () => {

            await interaction.reply({
                flags: ["Ephemeral"],
                content: "Either Command wasn't found or thrown an error."
            })

        }

        if (commandMap.has(commandName)) {
            const command = commandMap.get(commandName)

            try {
                await command!.onExecute(interaction);
            } catch (err) {
                ExceptionalLogger.getInstance().throw(err as Error);
                await commandError();
            }
        } else {
            await commandError();
        }
    }
})