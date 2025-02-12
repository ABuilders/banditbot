import { ChatInputCommandInteraction, PermissionResolvable } from "discord.js";
import { CommandBase, CommandDataStructure, createBanditEmbed, EnumCommandCategoryType, replyEmbed } from "../structures";
import { PunishmentManager } from "../structures/punishments/PunishmentManager";

export abstract class ModerationCommand extends CommandBase {

    private punishmentManager: PunishmentManager;

    constructor(data: CommandDataStructure, type: EnumCommandCategoryType, private requiredPermission: PermissionResolvable) {
        super(data, type);
        this.punishmentManager = new PunishmentManager();
    }

    getPunishmentManager() { return this.punishmentManager }

    abstract onModerationExecute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>

    async onExecute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        if (!interaction.member.permissions.has(this.requiredPermission)) return replyEmbed(
            interaction,
            createBanditEmbed()
                .setDescription(`\`\`\`md\n# Invalid Permissions! You must have ${this.requiredPermission}\`\`\``)
                .setColor("Red")
        );
        await this.onModerationExecute(interaction);
    }

}