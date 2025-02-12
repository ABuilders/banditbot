/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-12 14:57:36
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 15:40:43
 */

import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import { BanditEngine } from "../BanditEngine";
import { BanditClient } from "../BanditClient";
import { ClientCollection } from "./ClientCollection";
import { Promisified } from "../typings";
import { ExceptionalLogger } from "./ExceptionalLogger";
import { createBanditEmbed } from "./Utils";

export type SequenceCallback<Arguments> = (...args: Arguments[]) => Promisified<unknown>;

export interface SequenceInfo<Arguments> {

    id: string;
    description: string;
    callback: SequenceCallback<Arguments>;

}

export class Sequence {

    static createSequence(response: ChatInputCommandInteraction<"cached"> | Message<true>, description: string) {
        return new Sequence(response, description);
    }

    private engine: BanditEngine;
    private client: BanditClient;
    private sequencesCollection: ClientCollection<string, SequenceInfo<any>>;
    private sequenceRunning: boolean = false;
    private erroredSequences: number = 0;
    private finishedSequences: number = 0;
    private successfulSequences: number = 0;
    private sequences: number = 0;
    private currentSequence?: SequenceInfo<any>;
    private contentMessage?: Message<true>;
        
    constructor(private response: ChatInputCommandInteraction<"cached"> | Message<true>, private description: string) {
        this.engine = BanditEngine.createEngine();
        this.client = this.engine.getClient(true);
        this.sequencesCollection = new ClientCollection();
    }

    getEngine() {
        return this.engine;
    }

    getClient() {
        return this.client;
    }

    getSequencesCollection() {
        return this.sequencesCollection;
    }

    addSequence(sequenceInfo: SequenceInfo<any>) {
        this.sequencesCollection.set(sequenceInfo.id, sequenceInfo);
        this.sequences++;
        return this;
    }

    getSequencesLength() {
        return this.sequences;
    }

    getBaseDescription() {
        return this.description;
    }

    async startSequences() {
        await this.updateContent();

        for (let i = 0; i<this.sequencesCollection.size; i++)
        {
            const sequenceInfo = this.getSequencesCollection().getIndex(i);
            if (!sequenceInfo) continue;
            const [ key, value ] = sequenceInfo;

            if (key === value.id) // They are gonna be the same, just for checking so no invalid sequences are added into the collection
            {
                this.sequenceRunning = true;
                this.currentSequence = value;

                try {
                    await value.callback();
                    this.successfulSequences++;
                } catch (err) {
                    ExceptionalLogger.getInstance().throw(err as Error);
                    this.erroredSequences++;
                } finally {
                    this.sequenceRunning = false;
                    this.finishedSequences++;
                }

                await this.updateContent();
            }
        }

        this.currentSequence = undefined;
    }

    async updateContent() {

        const embed = this.generateEmbed();
        const options = {
            embeds: [embed]
        };

        if (!this.contentMessage) {

            if (this.response instanceof ChatInputCommandInteraction) {
                if (!this.response.deferred || !this.response.replied) {
                    await this.response.reply(options);

                    this.contentMessage = await this.response.fetchReply();
                } else {
                    this.contentMessage = await this.response.followUp(options);
                }
            } else {
                this.contentMessage = await this.response.reply(options);
            }
            
        } else {

            await this.contentMessage.edit(options);

        }

    }

    generateEmbed() {

        let type: "Successful" | "Failing";
        let embed: EmbedBuilder;

        if (this.successfulSequences > this.erroredSequences) {
            type = "Successful";
        } else {
            type = "Failing";
        }

        embed = createBanditEmbed()
            .setFooter({
                text: "Bandit Sequence Manager",
                iconURL: this.getClient().getClientUser(true).displayAvatarURL()
            })
            .setTitle("🎯 Sequence Status")
            .setDescription([
                '```md',
                `# ${this.getBaseDescription()}`,
                '```',
                '',
                '**🔄 Current Sequence**',
                `${this.currentSequence?.description ?? "*No active sequence.*"}`,
                '',
                `**${type === "Successful" ? "✅ Status: Success" : "❌ Status: Failed"}**`,
                type === "Successful"
                    ? "> Operation completed successfully."
                    : "> An error occurred during execution.",
                '',
                '**📊 Statistics**',
                '```properties',
                `✨ Success Rate: ${((this.successfulSequences / (this.finishedSequences || 1)) * 100).toFixed(1)}%`,
                `🎯 Successful: ${this.successfulSequences}`,
                `❌ Failed: ${this.erroredSequences}`,
                `🏁 Total Completed: ${this.finishedSequences}`,
                '```'
            ].join('\n'))
            .setColor(type === "Successful" ? "#57F287" : "#ED4245")
            .setFooter({
                text: `Last Updated • ${new Date().toLocaleTimeString()}`,
            })
            .setTimestamp();

        return embed;
    }

    isAnySequenceRunning() {
        return this.sequenceRunning;
    }

}