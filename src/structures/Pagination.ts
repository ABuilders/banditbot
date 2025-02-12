/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 23:15:37
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 14:53:05
 */

import { EmbedBuilder, User, ButtonStyle, ButtonInteraction, ComponentType, ChatInputCommandInteraction } from 'discord.js';

type PaginationData = {
    content: EmbedBuilder;
    footer?: string;
}

export class Pagination
{
    private currentPage: number = 0;
    private messageId: string | undefined;
    private interaction!: ChatInputCommandInteraction<"cached">;

    constructor(
        private user: User, // User who initiated the command
        private pages: PaginationData[], // Pages to be displayed in the paginator
        private timeout: number = 60000, // Time until the paginator is disabled (in ms)
    ) { }

    /**
     * Starts the pagination process.
     */
    async start(interaction: ChatInputCommandInteraction<"cached">)
    {
        this.interaction = interaction;

        // Send the initial reply with the first page
        const reply = await interaction.followUp({
            embeds: [this.pages[this.currentPage].content],
            fetchReply: true
        });

        this.messageId = reply.id;
        await this.addPaginationButtons(reply);
        this.setupPaginationReactions(reply);
    }

    /**
     * Adds the pagination buttons (left and right arrows).
     */
    private async addPaginationButtons(reply: any)
    {
        // Send the pagination buttons as a reply
        await this.interaction.editReply({
            content: 'Use the buttons below to navigate through the pages.',
            components: [
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 2, // Button
                            style: ButtonStyle.Secondary,
                            label: '⬅️ Previous',
                            customId: 'previous',
                        },
                        {
                            type: 2, // Button
                            style: ButtonStyle.Secondary,
                            label: '➡️ Next',
                            customId: 'next',
                        },
                    ]
                }
            ]
        });
    }

    /**
     * Sets up the reactions and their event listeners for pagination.
     */
    private setupPaginationReactions(reply: any)
    {
        const filter = (interaction: ButtonInteraction) =>
        {
            return interaction.user.id === this.user.id && ['previous', 'next'].includes(interaction.customId);
        };

        const collector = reply.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: this.timeout
        });

        collector.on('collect', async (interaction: ButtonInteraction) =>
        {
            if (interaction.customId === 'previous')
            {
                this.currentPage = this.currentPage === 0 ? this.pages.length - 1 : this.currentPage - 1;
            } else if (interaction.customId === 'next')
            {
                this.currentPage = this.currentPage === this.pages.length - 1 ? 0 : this.currentPage + 1;
            }

            // Update the embed with the new page content
            await this.interaction.editReply({
                embeds: [this.pages[this.currentPage].content]
            });

            await interaction.deferUpdate(); // Acknowledge the button press
        });

        collector.on('end', () =>
        {
            this.interaction.editReply({
                content: 'Pagination session ended.',
                components: [] // Disable further interaction by clearing the buttons
            });
        });
    }
}
