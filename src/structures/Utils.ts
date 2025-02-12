/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 19:14:54
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 18:13:06
 */

import {ActivityOptions, ActivityType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, Message } from "discord.js";
import { MainConfig, OmitMultiple } from "../typings";
import { YamlConfiguration } from "./configuration/YamlConfiguration";

export function createActivity(name: string, type: ActivityType, optional?: OmitMultiple<ActivityOptions, "name" | "type">): ActivityOptions {
    return {
        name: name,
        type,
        ...optional
    }
}

export function concat<T extends object, U extends object>(obj1: T, obj2: U): T & U
{
    return { ...obj1, ...obj2 };
}

export function generateID(prefix: string = "task"): string
{
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

export function createBanditEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setTimestamp()
        .setFooter({
            text: "Bandit Bot - Abuilders Development"
        });
}

export function isTimeoutable(member: GuildMember)
{
    if (!member.manageable) return false; // Checks role hierarchy
    if (member.guild.ownerId === member.id) return false; // Prevents timing out the server owner

    return true;
}

export function isTimedOut(member: GuildMember)
{
    return member.communicationDisabledUntilTimestamp !== null && member.communicationDisabledUntilTimestamp > Date.now();
}

export async function replyEmbed(response: ChatInputCommandInteraction<"cached"> | Message<true>, embed: EmbedBuilder) {
    if (response instanceof ChatInputCommandInteraction) {
        if (response.deferred || response.replied) {
            response.followUp({
                embeds: [
                    embed
                ]
            })
        } else {
            await response.reply({
                embeds: [
                    embed
                ]
            })
        }
    } else {
        await response.reply({
            embeds: [
                embed
            ]
        })
    }
}

export function getDefaultMainConfigContent(): string {
    return YamlConfiguration.stringify<MainConfig>({
        database: {
            type: "sqlite",
            information: {
                file: "main.banditdb"
            }
        },
        developers: [
            "1262884744111067157"
        ]
    });
}