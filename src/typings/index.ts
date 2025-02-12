/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-10 17:56:01
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 18:12:52
 */

import { Awaitable, ClientEvents, ClientOptions } from "discord.js";
import { ClientRegistry } from "../structures/ClientRegistry";

export interface BanditOptions extends ClientOptions
{

    token?: string;

}

export interface BanditEvents extends ClientEvents
{
    initialize: [];
}

export interface EventBody<Key extends keyof BanditEvents>
{

    name: Key;
    once?: boolean;
    callback: (...args: BanditEvents[Key]) => Promisified<unknown>;

}

export type Promisified<Value> = Value | PromiseLike<Value>
export type Registry<T> = T;
export type RegistryCallback<V> = (registry: ClientRegistry<V>) => ClientRegistry<V>;
export type DataStructure<T> = T & {
    __index: T;
}
export type Class = new (...args: any[]) => unknown;
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>;
export type NoneInstantiatedClass<T> = new (...args: any[]) => T;
export type BanditVersion = "1";
export type YamlSchema<S> = S & {
    configVersion: BanditVersion;
}
export type MainConfig = {
    database: {

        type: "mysql" | "sqlite";
        information: {
            file?: `${string}.banditdb`;
            host?: string;
            port?: number;
            username?: string;
            password?: string;
            database?: string;
        }

    },

    developers: string[]
}