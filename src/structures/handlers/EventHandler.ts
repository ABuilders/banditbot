/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 19:11:38
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-10 22:34:07
 */

import { IHandler } from "./IHandler";
import * as path from "path";
import * as fs from "fs";
import { BanditEvents, EventBody } from "../../typings";
import { BanditEngine } from "../../BanditEngine";
import { ExceptionalLogger } from "../ExceptionalLogger";

export class EventHandler implements IHandler<EventBody<keyof BanditEvents>>
{
    loadEvents() {
        const events = this.load(path.join("events", "auto"));

        this.registerEvents(events);
    }

    load(dir: string): EventBody<keyof BanditEvents>[]
    {
        const pathSrc = path.join(process.cwd(), "src", dir);
        const dirContents = fs.readdirSync(pathSrc, { encoding: "utf-8", withFileTypes: true });
        const events: EventBody<keyof BanditEvents>[] = [];

        for (const element of dirContents)
        {
            if (element.isDirectory()) {
                throw new Error("Loading events from directories isn't supported!");
            }

            ExceptionalLogger.getInstance().info("Loading " + EventHandler.name + " Element: " + element.name);
            const requiredFile = require(path.join(pathSrc, element.name));
            if (!this.containsDetails(requiredFile.default)) {
                ExceptionalLogger.getInstance().debug("Invalid " + EventHandler.name + " Element Information for " + element.name);
                continue;
            }

            events.push(requiredFile.default);
        }

        return events;
    }

    registerEvents(events: EventBody<keyof BanditEvents>[]): void {
        const engine = BanditEngine.createEngine();

        engine.useEventRegistry((registry) => {

            return registry.addAll(events);

        });
    } 

    private containsDetails(file: unknown): file is EventBody<keyof BanditEvents>
    {
        return typeof file === "object" && file !== null && "name" in file && "callback" in file;
    }


}