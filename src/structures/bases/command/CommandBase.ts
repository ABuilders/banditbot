import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { Promisified } from "../../../typings";
import { BanditEngine } from "../../../BanditEngine";

export enum EnumCommandCategory {
    Core
}

export abstract class CommandBase {

    private dataStructure: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    private engine: BanditEngine;
    public category: EnumCommandCategory;

    constructor(dataStructure: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder, category: EnumCommandCategory) {
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