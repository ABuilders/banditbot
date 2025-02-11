import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ColorResolvable } from "discord.js";
import { CommandBase, EnumCommandCategory } from "../../structures";
import { Pagination } from "../../structures/Pagination";

interface CategoryConfig
{
    icon: string;
    color: ColorResolvable;
    description?: string;
    emoji?: string;
}

export default class HelpCommand extends CommandBase
{
    private readonly categoryConfigs: Record<EnumCommandCategory, CategoryConfig> = {
        [EnumCommandCategory.Core]: {
            icon: "💡",
            color: "#5865F2", // Discord Blurple
            description: "Essential commands for the bot",
            emoji: "🎯"
        },
        // Add other categories with their configs
    };

    private readonly defaultConfig: CategoryConfig = {
        icon: "📜",
        color: "#2D3136", // Dark theme color
        description: "Additional commands",
        emoji: "✨"
    };

    constructor()
    {
        super(
            new SlashCommandBuilder()
                .setName("help")
                .setDescription("📚 Browse through available commands")
                .addStringOption(option =>
                    option
                        .setName("category")
                        .setDescription("Filter commands by category")
                        .setRequired(false)
                ),
            EnumCommandCategory.Core
        );
    }

    async onExecute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        try
        {
            if (!interaction.deferred && !interaction.replied)
            {
                await interaction.deferReply();
            }

            const selectedCategory = interaction.options.getString("category")?.toLowerCase();
            const commandMap = this.getEngine().getClient(true).getCommandMap();
            const categorizedCommands = this.categorizeCommands(commandMap);

            // Filter categories if a specific one was requested
            const categoriesToShow = selectedCategory
                ? Object.entries(categorizedCommands).filter(([category]) =>
                    category.toLowerCase() === selectedCategory)
                : Object.entries(categorizedCommands);

            if (categoriesToShow.length === 0)
            {
                await interaction.editReply({
                    content: `No commands found${selectedCategory ? ` for category "${selectedCategory}"` : ''}.`
                });
                return;
            }

            const pages = this.createPages(categoriesToShow, interaction);
            const paginator = new Pagination(interaction.user, pages, 60000);
            await paginator.start(interaction);

        } catch (error)
        {
            console.error("Error in help command:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

            if (!interaction.replied)
            {
                await interaction.editReply({
                    content: `Failed to display help menu: ${errorMessage}`
                });
            }
        }
    }

    private categorizeCommands(commandMap: Map<string, CommandBase>): Record<EnumCommandCategory, CommandBase[]>
    {
        const categorized: Record<EnumCommandCategory, CommandBase[]> = Object.values(EnumCommandCategory).reduce(
            (acc, category) => ({ ...acc, [category]: [] }),
            {} as Record<EnumCommandCategory, CommandBase[]>
        );

        commandMap.forEach((command) =>
        {
            const category = command.category || EnumCommandCategory.Core;
            categorized[category].push(command);
        });

        // Sort commands alphabetically within each category
        Object.values(categorized).forEach(commands =>
        {
            commands.sort((a, b) =>
                a.getDataStructure().name.localeCompare(b.getDataStructure().name)
            );
        });

        return categorized;
    }

    private createPages(
        categorizedCommands: [string, CommandBase[]][],
        interaction: ChatInputCommandInteraction<"cached">
    ): { content: EmbedBuilder }[]
    {
        return categorizedCommands.map(([category, commands]) =>
        {
            const categoryEnum = category as unknown as EnumCommandCategory;
            const config = this.categoryConfigs[categoryEnum] || this.defaultConfig;

            const description = [
                `${config.emoji} ${config.description || ""}`,
                "",
                "# Available Commands",
                "",
                ...commands.map(command =>
                {
                    const data = command.getDataStructure();
                    const options = data.options?.length
                        ? `\`${data.options.map(opt => opt.toJSON().name).join(', ')}\``
                        : '';
                    return [
                        `### /${data.name} ${options}`,
                        `> ${data.description || "No description available."}`,
                        ""
                    ].join('\n');
                })
            ].join('\n');

            const totalCommands = commands.length;
            const pageNumber = categorizedCommands.indexOf([category, commands]) + 1;

            return {
                content: new EmbedBuilder()
                    .setTitle(`${config.icon} ${category.toUpperCase()} COMMANDS`)
                    .setDescription(description)
                    .setColor(config.color)
                    .setTimestamp()
                    .addFields([
                        {
                            name: '📊 Statistics',
                            value: `\`\`\`• Commands: ${totalCommands}\n• Category: ${category}\n• Page: ${pageNumber}/${categorizedCommands.length}\`\`\``,
                            inline: false
                        }
                    ])
                    .setFooter({
                        text: `Tip: Use /command for detailed information • Page ${pageNumber}/${categorizedCommands.length}`,
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                    .setThumbnail(interaction.client.user.displayAvatarURL())
            };
        });
    }
}