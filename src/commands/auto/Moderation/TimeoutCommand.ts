/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-12 15:45:29
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 18:02:14
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { EnumCommandCategory } from "../../../structures";
import { ModerationCommand } from "../../ModerationCommand";
import { Sequence } from "../../../structures/Sequence";
import ms from "ms";

export default class TimeoutCommand extends ModerationCommand
{

    constructor()
    {
        super(
            new SlashCommandBuilder()
                .setName("timeout")
                .setDescription("🔨 Timeout's a user from this guild!")
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName("member")
                        .setDescription("👥 Member to timeout from this guild.")
                        .setRequired(true)
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("duration")
                        .setDescription("⏰ Duration for the timeout, eg: 10s, 1m, 1d. Pass -1 to remove timeout")
                        .setRequired(true)
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("reason")
                        .setDescription(`📋 Reason for the punishment.`)
                ),
            EnumCommandCategory.Moderation,
            "ModerateMembers"
        );
    }

    async onModerationExecute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.deferReply();

        const guildPunishmentManager = await this.getPunishmentManager().getPerGuild(interaction.guild);
        const member = interaction.options.getMember("member");
        const duration = interaction.options.getString("duration", true);
        
        if (!member) return;
        const reason = interaction.options.getString("reason") ?? "No reason was provided.";
        const sequences = new Sequence(interaction, "Timeout Guild Member", true);

        sequences.addSequence({
            id: `timeout-${member.user.username}`,
            description: `Timing out the user ${member.user.username} from ${interaction.guild.name}`,
            callback: async (setResultMessage) =>
            {

                try
                {
                    let result;
                    if (duration === "-1")
                    {
                        result = await guildPunishmentManager.untimeout(member, reason);
                    }
                    else 
                    {
                        result = await guildPunishmentManager.timeout(member, interaction.member, duration as ms.StringValue, reason);
                    }
                    
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