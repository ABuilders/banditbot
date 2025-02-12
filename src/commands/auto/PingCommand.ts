/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 22:08:04
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 14:54:08
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandBase, EnumCommandCategory } from "../../structures";

export default class PingCommand extends CommandBase {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("ping")
                .setDescription("🏓 Pong!"),
            EnumCommandCategory.Core,
        )
    }

    async onExecute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.reply({
            content: "🏓 Pong!",
            flags: [
                "Ephemeral"
            ]
        });

        const wsPing = Math.round(this.getEngine().getClient(true).ws.ping);
        const latency = Math.round(Date.now() - interaction.createdTimestamp);

        setTimeout(async () => {
            await interaction.editReply({
                content: `WS: \`${wsPing}ms\`, Latency: \`${latency}ms\``
            });
        }, 2500)
    }
}