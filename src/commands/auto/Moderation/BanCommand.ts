/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-12 15:45:29
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 18:01:52
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { EnumCommandCategory } from "../../../structures";
import { Promisified } from "../../../typings";
import { ModerationCommand } from "../../ModerationCommand";
import { Sequence } from "../../../structures/Sequence";

export default class BanCommand extends ModerationCommand {

    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("ban")
                .setDescription("🔨 Ban a user from this guild!")
                .addUserOption(
                    new SlashCommandUserOption()
                        .setName("member")
                        .setDescription("👥 Member to ban from this guild.")
                        .setRequired(true)
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("reason")
                        .setDescription(`📋 Reason for the punishment.`)
                ),
            EnumCommandCategory.Moderation,
            "BanMembers"
        );
    }

    async onModerationExecute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        await interaction.deferReply();
        
        const guildPunishmentManager = await this.getPunishmentManager().getPerGuild(interaction.guild);
        const member = interaction.options.getMember("member");
        if (!member) return;
        const reason = interaction.options.getString("reason") ?? "No reason was provided.";
        const sequences = new Sequence(interaction, "Banning Guild Member", true);

        sequences.addSequence({
            id: `ban-${member.user.username}`,
            description: `Banning the user ${member.user.username} from ${interaction.guild.name}`,
            callback: async (setResultMessage) => {
                
                try {
                    const result = await guildPunishmentManager.ban(member, interaction.member, reason);
                    setResultMessage(result);
                } catch (err) {
                    throw err;
                }

            }
        });

        await sequences.startSequences();
    }

}