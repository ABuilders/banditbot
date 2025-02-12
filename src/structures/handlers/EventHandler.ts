/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 19:11:38
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 14:52:04
 */

import { IHandler } from "./IHandler";
import * as path from "path";
import * as fs from "fs";
import { BanditEvents, EventBody } from "../../typings";
import { BanditEngine } from "../../BanditEngine";
import { ExceptionalLogger } from "../ExceptionalLogger";

export class EventHandler implements IHandler<EventBody<keyof BanditEvents>>
{
    loadEvents()
    {
        const events = this.load(path.join("events", "auto"));

        this.registerEvents(events);
    }

    load(dir: string): EventBody<keyof BanditEvents>[]
    {
        const srcPath = path.join(process.cwd(), "src");
        const pathSrc = dir.startsWith(srcPath) ? dir : path.join(srcPath, dir);
        const dirContents = fs.readdirSync(pathSrc, { encoding: "utf-8", withFileTypes: true });
        const events: EventBody<keyof BanditEvents>[] = [];

        for (const element of dirContents)
        {
            if (element.isDirectory())
            {
                const dirPath = path.join(pathSrc, element.name);
                events.push(...this.load(dirPath));
                continue;
            }

            ExceptionalLogger.getInstance().info("Loading " + EventHandler.name + " Element: " + element.name);
            const requiredFile = require(path.join(pathSrc, element.name));
            if (!this.containsDetails(requiredFile.default))
            {
                ExceptionalLogger.getInstance().debug("Invalid " + EventHandler.name + " Element Information for " + element.name);
                continue;
            }

            events.push(requiredFile.default);
        }

        return events;
    }

    registerEvents(events: EventBody<keyof BanditEvents>[]): void
    {
        const engine = BanditEngine.createEngine();

        engine.useEventRegistry((registry) =>
        {

            return registry.addAll(events);

        });
    }

    private containsDetails(file: unknown): file is EventBody<keyof BanditEvents>
    {
        return typeof file === "object" && file !== null && "name" in file && "callback" in file;
    }


}