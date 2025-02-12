/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 21:57:30
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 14:52:51
 */

export function isDevelopmentEnvironment(): boolean {
    return process.argv.includes("--dev") && isDebugging();
}

export function isDebugging(): boolean {
    return process.argv.includes("-d") || process.argv.includes("--debug");
}