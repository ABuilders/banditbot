import { ChatInputCommandInteraction } from "discord.js";
import { CommandBase, createBanditEmbed, isADevelopmentUser, replyEmbed } from "../structures";

export abstract class TestingCommand extends CommandBase {

    abstract onTest(interaction: ChatInputCommandInteraction<"cached">): Promise<void>

    async onExecute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        if (!isADevelopmentUser(interaction.user.id)) return replyEmbed(interaction, createBanditEmbed().setDescription(`\`\`\`md\n# You are not a developer nor a tester to use this command!\`\`\``).setColor("Red"));
    
        await this.onTest(interaction);
    }

}