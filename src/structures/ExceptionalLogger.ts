/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 17:43:13
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-10 22:33:01
 */

import * as fs from "fs";
import * as path from "path";
import clc from "cli-color";
import { isDebugging } from "./Development";

export class ExceptionalLogger
{
    private static instance: ExceptionalLogger;
    private logFile: string;
    private parentLogsFolder: string;

    static getInstance()
    {
        if (!ExceptionalLogger.instance) ExceptionalLogger.instance = new ExceptionalLogger();
        return ExceptionalLogger.instance;
    }

    constructor(logFileName: string = 'logs.txt')
    {
        this.parentLogsFolder = path.join(process.cwd(), "logs");
        this.logFile = path.join(this.parentLogsFolder, logFileName);
        this.ensureLogFile();
    }

    private ensureLogFile()
    {
        fs.mkdirSync(this.parentLogsFolder, { recursive: true });
        if (!fs.existsSync(this.logFile))
        {
            fs.writeFileSync(this.logFile, '', { flag: 'w' });
        }
    }

    private autoSave(logEntry: string)
    {
        fs.appendFileSync(this.logFile, clc.strip(logEntry) + '\n');
    }

    private formatMessage(level: string, message: string): string
    {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }

    info(message: string)
    {
        const logEntry = this.formatMessage('info', message);
        console.log(clc.cyan(logEntry));
        this.autoSave(logEntry);
    }

    warn(message: string)
    {
        const logEntry = this.formatMessage('warn', message);
        console.log(clc.yellow(logEntry));
        this.autoSave(logEntry);
    }

    error(message: string)
    {
        const logEntry = this.formatMessage('error', message);
        console.log(clc.red(logEntry));
        this.autoSave(logEntry);
    }

    throw(error: Error): never
    {
        const logEntry = this.formatMessage('error', error.message) + "\n" + error.stack;
        console.log(logEntry);
        this.autoSave(logEntry);
        return process.exit(1);
    }

    debug(message: string)
    {
        if (!isDebugging()) return;
        const logEntry = this.formatMessage('debug', message);
        console.log(clc.magentaBright(logEntry));
        this.autoSave(logEntry);
    }
}