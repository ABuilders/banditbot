/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 19:14:54
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 15:19:53
 */

import {ActivityOptions, ActivityType, EmbedBuilder } from "discord.js";
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

export function createBanditEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setTimestamp()
        .setFooter({
            text: "Bandit Bot - Abuilders Development"
        });
}

export function getDefaultMainConfigContent(): string {
    return YamlConfiguration.stringify<MainConfig>({
        database: {
            type: "sqlite",
            information: {
                file: "main.banditdb"
            }
        }
    });
}