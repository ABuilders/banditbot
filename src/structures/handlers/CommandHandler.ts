/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 17:37:55
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-10 22:31:48
 */

import { CommandBase } from "../bases/command/CommandBase";
import { IHandler } from "./IHandler";
import * as path from "path";
import * as fs from "fs";
import { BanditEngine } from "../../BanditEngine";
import { ExceptionalLogger } from "../ExceptionalLogger";

export class CommandHandler implements IHandler<CommandBase>
{
    loadCommands()
    {
        const commands = this.load(path.join("commands", "auto"));

        this.registerCommands(commands);
    }

    load(dir: string): CommandBase[]
    {
        const pathSrc = path.join(process.cwd(), "src", dir);
        const dirContents = fs.readdirSync(pathSrc, { encoding: "utf-8", withFileTypes: true });
        const commands: CommandBase[] = [];

        for (const element of dirContents)
        {
            if (element.isDirectory())
            {
                throw new Error("Loading commands from directories isn't supported!");
            }

            ExceptionalLogger.getInstance().info("Loading " + CommandHandler.name + " Element: " + element.name);
            const e: any = require(path.join(pathSrc, element.name));
            const initializedClass = new e.default();
            if (!initializedClass || !this.containsDetails(initializedClass)) {
                ExceptionalLogger.getInstance().debug("Invalid " + CommandHandler.name + " Element Information for " + element.name);
                continue;
            }

            commands.push(initializedClass);
        }

        return commands;
    }

    registerCommands(commands: CommandBase[]): void
    {
        const engine = BanditEngine.createEngine();

        engine.useCommandRegistry((registry) => registry.addAll(commands));
    }

    private containsDetails(file: unknown): file is CommandBase
    {
        return file instanceof CommandBase;
    }


}