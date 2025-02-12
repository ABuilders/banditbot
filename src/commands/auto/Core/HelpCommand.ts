/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 23:13:33
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 16:20:38
 */

import
{
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    ColorResolvable,
    ButtonStyle,
    ButtonInteraction,
    ComponentType,
    ActionRowBuilder,
    ButtonBuilder
} from "discord.js";
import { CommandBase, EnumCommandCategory, EnumCommandCategoryType } from "../../../structures";

interface CategoryConfig
{
    icon: string;
    color: ColorResolvable;
    description: string;
}

export default class HelpCommand extends CommandBase
{
    private readonly categoryConfigs: Record<EnumCommandCategoryType, CategoryConfig> = {
        Core: {
            icon: "⚡",
            color: "#5865F2",
            description: "Core features and essentials"
        },
        Utility: {
            icon: "🔨",
            color: "Blue",
            description: "Utility features and essentials"
        },
        Moderation: {
            icon: "🛡️",
            color: "Red",
            description: "Moderation features and essentails"
        }
    };

    constructor()
    {
        super(
            new SlashCommandBuilder()
                .setName("help")
                .setDescription("View all available commands")
                .addStringOption(option =>
                    option
                        .setName("category")
                        .setDescription("Filter by category")
                        .setRequired(false)
                        .addChoices(
                            ...Object.keys(EnumCommandCategory).map(cat => ({
                                name: cat,
                                value: cat.toLowerCase()
                            }))
                        )
                ),
            EnumCommandCategory.Core
        );
    }

    async onExecute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>
    {
        try
        {
            await interaction.deferReply();
            const selectedCategory = interaction.options.getString("category")?.toLowerCase();
            const commandMap = this.getEngine().getClient(true).getCommandMap();
            const categorizedCommands = this.categorizeCommands(commandMap);

            const pages = await this.createPages(categorizedCommands, interaction);
            await this.startPagination(interaction, pages);
        } catch (error)
        {
            console.error("Error in help command:", error);
            await interaction.editReply({
                content: "❌ Couldn't load commands. Try again later."
            });
        }
    }

    private categorizeCommands(commandMap: Map<string, CommandBase>): Record<EnumCommandCategoryType, CommandBase[]>
    {
        const categorized: Record<EnumCommandCategoryType, CommandBase[]> = Object.values(EnumCommandCategory).reduce(
            (acc, category) => ({ ...acc, [category]: [] }),
            {} as Record<EnumCommandCategoryType, CommandBase[]>
        );

        for (const command of commandMap.values())
        {
            const category = command.category || EnumCommandCategory.Core;
            categorized[category].push(command);
        }

        Object.values(categorized).forEach(commands =>
        {
            commands.sort((a, b) =>
                a.getDataStructure().name.localeCompare(b.getDataStructure().name)
            );
        });

        return categorized;
    }

    private async createPages(
        categorizedCommands: Record<EnumCommandCategoryType, CommandBase[]>,
        interaction: ChatInputCommandInteraction<"cached">
    ): Promise<EmbedBuilder[]>
    {
        const pages: EmbedBuilder[] = [];

        for (const [category, commands] of Object.entries(categorizedCommands))
        {
            if (commands.length === 0) continue;

            const categoryEnum = category as EnumCommandCategoryType;
            const config = this.categoryConfigs[categoryEnum];

            const commandsList = commands.map(cmd =>
            {
                const data = cmd.getDataStructure();
                const options = data.options?.length
                    ? ` ${data.options.map(opt => `\`${opt.toJSON().name}\``).join(' ')}`
                    : '';

                return `\`/${data.name}\`${options}\n${data.description}`;
            }).join('\n\n');

            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setAuthor({
                    name: `${config.icon} ${category.toUpperCase()}`,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setDescription([
                    config.description,
                    '',
                    commandsList
                ].join('\n'))
                .setFields({
                    name: '\u200b',
                    value: `${commands.length} commands available`,
                    inline: false
                });

            pages.push(embed);
        }

        return pages;
    }

    private async startPagination(
        interaction: ChatInputCommandInteraction<"cached">,
        pages: EmbedBuilder[]
    ): Promise<void>
    {
        let currentPage = 0;

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setEmoji('◀️')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Secondary)
            );

        const response = await interaction.editReply({
            embeds: [pages[currentPage].setFooter({
                text: `Page ${currentPage + 1}/${pages.length}`,
                iconURL: interaction.client.user.displayAvatarURL()
            })],
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000,
            filter: (i) => i.user.id === interaction.user.id
        });

        collector.on('collect', async (i: ButtonInteraction) =>
        {
            if (i.customId === 'previous')
            {
                currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
            } else if (i.customId === 'next')
            {
                currentPage = currentPage < pages.length - 1 ? currentPage + 1 : 0;
            }

            await i.update({
                embeds: [pages[currentPage].setFooter({
                    text: `Page ${currentPage + 1}/${pages.length}`,
                    iconURL: interaction.client.user.displayAvatarURL()
                })],
                components: [row]
            });
        });

        collector.on('end', async () =>
        {
            await interaction.editReply({
                components: []
            });
        });
    }
}