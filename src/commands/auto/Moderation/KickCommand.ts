/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-12 15:45:29
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 18:02:01
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { EnumCommandCategory } from "../../../structures";
import { ModerationCommand } from "../../ModerationCommand";
import { Sequence } from "../../../structures/Sequence";

export default class KickCommand extends ModerationCommand
{

    constructor()
    {
        super(
            new SlashCommandBuilder()
                .setName("kick")
                .setDescription("🔨 Kick a user from this guild!")
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName("member")
                        .setDescription("👥 Member to kick from this guild.")
                        .setRequired(true)
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("reason")
                        .setDescription(`📋 Reason for the punishment.`)
                ),
            EnumCommandCategory.Moderation,
            "KickMembers"
        );
    }

    async onModerationExecute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.deferReply();

        const guildPunishmentManager = await this.getPunishmentManager().getPerGuild(interaction.guild);
        const member = interaction.options.getMember("member");
        if (!member) return;
        const reason = interaction.options.getString("reason") ?? "No reason was provided.";
        const sequences = new Sequence(interaction, "Kicking Guild Member", true);

        sequences.addSequence({
            id: `kick-${member.user.username}`,
            description: `Kicking the user ${member.user.username} from ${interaction.guild.name}`,
            callback: async (setResultMessage) =>
            {

                try
                {
                    const result = await guildPunishmentManager.kick(member, interaction.member, reason);
                    setResultMessage(result);
                } catch (err)
                {
                    throw err;
                }

            }
        });

        await sequences.startSequences();
    }

}