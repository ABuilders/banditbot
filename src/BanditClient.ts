/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 17:33:34
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 16:33:05
 */

import { Client, ClientEvents, ClientUser, Collection, Guild, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { BanditEvents, BanditOptions, Promisified } from "./typings";
import * as Figlet from "figlet";
import { CommandBase, ExceptionalBox, isDevelopmentEnvironment } from "./structures";

export class BanditClient<Ready extends boolean = boolean> extends Client<Ready>
{
    private commandMap: Collection<string, CommandBase> = new Collection();
    private commandJSONArray: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    constructor(options: BanditOptions)
    {
        super(options);
    }

    getOptions()
    {
        return this.options as BanditOptions;
    }

    async initialize()
    {

        let figletText = Figlet.textSync("Bandit");
        if (isDevelopmentEnvironment()) {
            figletText += `\n\nUsing Development Environment.`
        }
        ExceptionalBox.createBox(figletText);

        this.emit("initialize");
    }

    public on<Key extends keyof BanditEvents>(event: Key, listener: (...args: BanditEvents[Key]) => unknown): this
    {
        super.on(event as keyof ClientEvents, listener as any);
        return this;
    }

    public once<Key extends keyof BanditEvents>(event: Key, listener: (...args: BanditEvents[Key]) => unknown): this
    {
        super.on(event as keyof ClientEvents, listener as any);
        return this;
    }

    registerEventNode<Key extends keyof BanditEvents>(nodeName: Key, once: boolean, callback: (...args: BanditEvents[Key]) => void)
    {
        if (once)
            this.once(nodeName, callback);
        else
            this.on(nodeName, callback);
    }

    registerCommandNode(nodeData: CommandBase) {
        this.commandMap.set(nodeData.getName(), nodeData);
        this.commandJSONArray.push(nodeData.getDataJSON());
    }

    getCommandMap() {
        return this.commandMap;
    }

    getCommandJSONArray() {
        return this.commandJSONArray;
    }

    async autologin()
    {
        try
        {
            await this.login(this.getOptions().token);
        } catch (err)
        {
            throw err;
        }
    }
    
    useInitialize(initializeCallback: () => Promisified<unknown>) {
        this.on("initialize", () => {
            initializeCallback();
        })
    }

    getClientUser(check: false): ClientUser | null;
    getClientUser(check: true): ClientUser;
    getClientUser(check: boolean): ClientUser | null | undefined
    {
        if (check)
        {
            if (this.user) return this.user;
        } else
        {
            return this.user;
        }
    }

    async fetchGuild(guildId: string): Promise<Guild> {
        return await this.guilds.fetch(guildId);
    }
}