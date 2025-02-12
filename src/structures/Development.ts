/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 21:57:30
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 18:14:01
 */

import { BanditEngine } from "../BanditEngine";

export function isDevelopmentEnvironment(): boolean {
    return process.argv.includes("--dev") && isDebugging();
}

export function isDebugging(): boolean {
    return process.argv.includes("-d") || process.argv.includes("--debug");
}

export function isADevelopmentUser(id: string) {
    const engine = BanditEngine.createEngine();
    const developers = engine.getMainConfiguration().get("developers") as string[];
    return developers.includes(id);
}