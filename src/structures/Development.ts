export function isDevelopmentEnvironment(): boolean {
    return process.argv.includes("--dev") && isDebugging();
}

export function isDebugging(): boolean {
    return process.argv.includes("-d") || process.argv.includes("--debug");
}