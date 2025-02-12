/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 21:33:03
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 17:15:55
 */

import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { Promisified } from "../../../typings";
import { BanditEngine } from "../../../BanditEngine";

export const EnumCommandCategory: Record<EnumCommandCategoryType, EnumCommandCategoryType> = {
    Core: "Core",
    Moderation: "Moderation",
    Utility: "Utility"
};

export type EnumCommandCategoryType = "Core" | "Moderation" | "Utility";
export type CommandDataStructure = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

export abstract class CommandBase {

    private dataStructure: CommandDataStructure;
    private engine: BanditEngine;
    public category: EnumCommandCategoryType;

    constructor(dataStructure: CommandDataStructure, category: EnumCommandCategoryType) {
        this.dataStructure = dataStructure;
        this.engine = BanditEngine.createEngine();
        this.category = category;
    }

    getDataStructure() {
        return this.dataStructure;
    }

    getDataJSON() {
        return this.getDataStructure().toJSON()
    }

    getName() {
        return this.getDataStructure().name;
    }

    getDescription() {
        return this.getDataStructure().description;
    }

    getEngine() {
        return this.engine;
    }

    abstract onExecute(interaction: ChatInputCommandInteraction<"cached">): Promisified<unknown>;

}