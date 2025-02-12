/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 19:14:54
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 14:53:21
 */

import {ActivityOptions, ActivityType } from "discord.js";
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