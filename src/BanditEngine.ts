/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 17:55:00
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-11 20:49:18
 */

import { BanditClient } from "./BanditClient";
import { CommandBase, ExceptionalLogger, getDefaultMainConfigContent, IHandler } from "./structures";
import { ClientRegistry } from "./structures/ClientRegistry";
import { YamlConfiguration, YamlConfigurationOptions } from "./structures/configuration/YamlConfiguration";
import { DatabaseManager } from "./structures/database/DatabaseManager";
import { BanditEvents, BanditOptions, EventBody, MainConfig, NoneInstantiatedClass, RegistryCallback } from "./typings";

export class BanditEngine
{

    private static instance: BanditEngine;

    private client?: BanditClient;
    private mainConfig: YamlConfiguration<MainConfig>
    private started: boolean = false;
    private database?: DatabaseManager;

    static createEngine()
    {
        if (!BanditEngine.instance) BanditEngine.instance = new BanditEngine();
        return BanditEngine.instance;
    }

    constructor()
    {
        this.mainConfig = this.createConfiguration<MainConfig>("main.yaml", { createIfNotExists: true, defaultContent: getDefaultMainConfigContent() });
    }

    createClient(creationOptions?: BanditOptions)
    {
        if (!this.client) this.client = new BanditClient(creationOptions ?? { intents: [] });
        return this.client;
    }

    createDatabase()
    {
        if (!this.database) this.database = new DatabaseManager();
        return this.database;
    }

    async startClient()
    {

        if (!this.checkClient() || !this.client) { return; }
        if (this.client.isReady() && this.started) throw new Error("Unable to start the client because the client has been started already!");

        await this.client.initialize();
        await this.client.autologin();

        return this.client;
    }

    private checkClient()
    {
        if (!this.client) throw new Error("Unable to start client because the client doesn't exist!");
        return true;
    }

    registerEvent(eventBody: EventBody<keyof BanditEvents>)
    {
        if (!this.checkClient() || !this.client) { return; }

        ExceptionalLogger.getInstance().debug("Registering event node: " + eventBody.name);
        this.client.registerEventNode(eventBody.name, eventBody.once ?? false, eventBody.callback);
    }

    registerCommand(command: CommandBase)
    {
        if (!this.checkClient() || !this.client) { return; }

        ExceptionalLogger.getInstance().debug("Registering command node: /" + command.getName());
        this.client.registerCommandNode(command);
    }

    useEventRegistry(callback: RegistryCallback<EventBody<any>>): void
    {
        let registry: ClientRegistry<EventBody<any>> = new ClientRegistry();
        registry = callback(registry);

        for (const [_, value] of registry.entries())
        {
            this.registerEvent(value);
        }
    }

    useCommandRegistry(callback: RegistryCallback<CommandBase>): void
    {
        let registry: ClientRegistry<CommandBase> = new ClientRegistry();
        registry = callback(registry);

        for (const [_, value] of registry.entries())
        {
            this.registerCommand(value);
        }
    }

    getClient(check: false): BanditClient | undefined;
    getClient(check: true): BanditClient;
    getClient(check: boolean): BanditClient | undefined
    {
        if (check)
        {
            if (this.client) return this.client;
        } else
        {
            return this.client;
        }
    }

    useHandler<T extends IHandler<any>>(handler: NoneInstantiatedClass<T>)
    {
        return new handler();
    }

    getMainConfiguration()
    {
        return this.mainConfig;
    }

    createConfiguration<K extends Record<string, any>>(file: string, options?: YamlConfigurationOptions)
    {
        return new YamlConfiguration<K>(file, options);
    }
}