/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-11 19:27:33
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 18:13:42
 */

import { MySQLDriver, QuickDB } from "quick.db";
import { ExceptionalLogger } from "../ExceptionalLogger";
import { BanditEngine } from "../../BanditEngine";
import path from "path";
import { DatabaseCollection } from "./DatabaseCollection";

export type FindMethod<K extends string, V> = (value: V, key: K, databaseManager: DatabaseManager, collection: DatabaseCollection<K, V>) => boolean;

export class DatabaseManager
{

    private db!: QuickDB;
    private engine: BanditEngine = BanditEngine.createEngine();
    private connected: boolean = false;
    private tables: string[] = [];

    constructor()
    {
        this.initialize().catch((err: Error) => ExceptionalLogger.getInstance().throw(err));
    }

    async initialize()
    {
        ExceptionalLogger.getInstance().info("Loading DatabaseManager...");
        const main = this.engine.getMainConfiguration();
        const db = main.get("database") as Record<string, any>;
        if (!db)
        {
            ExceptionalLogger.getInstance().warn("Skipping database intialization.");
            return;
        }

        let quickdb;

        if (db.type.toLowerCase() === "mysql")
        {

            const { host, password, port, username, database } = db.information;
            const driver = new MySQLDriver({
                host: host,
                port: port,
                password: password,
                user: username,
                database: database
            });

            try 
            {
                ExceptionalLogger.getInstance().debug("Starting MySQL Client Connection...");
                await driver.connect();
                ExceptionalLogger.getInstance().debug("Connected to MySQL Server...");
            } catch (err)
            {
                throw new Error("Unable to connect to MySQL database, please check the information!");
            }

            quickdb = new QuickDB({
                driver: driver
            });

        } else if (db.type.toLowerCase() === "sqlite")
        {

            const { file } = db.information;
            if (!file?.endsWith(".banditdb")) throw new Error("Invalid Sqlite file, must end with .banditdb!");
            ExceptionalLogger.getInstance().debug("Starting Sqlite Client Connection...");
            quickdb = new QuickDB({
                filePath: path.join(process.cwd(), `databases`, file)
            });
            ExceptionalLogger.getInstance().debug("Connected to Sqlite Server...");

        } else
        {
            throw new Error("Invalid database type in configuration!");
        }

        this.db = quickdb;
        this.connected = true;
        ExceptionalLogger.getInstance().info("Successfully finished initializing DatabaseManager!");
    }

    public initializeCollection<K extends string, V>(table: string): DatabaseCollection<K, V> {
        this.checkTable(table);
        const collection = new DatabaseCollection<K, V>(this, table);
        return collection;
    }

    public getCollection<K extends string, V>(table: string | DatabaseCollection<K, V>, options?: { createIfNotExists?: boolean }): DatabaseCollection<K, V>
    {

        if (table instanceof DatabaseCollection) return table;

        if (options && options.createIfNotExists)
        {
            this.checkTable(table);
        }

        const collection = new DatabaseCollection<K, V>(this, table);
        return collection;
    }

    public getQuickDatabase()
    {
        return this.db;
    }

    public isConnected()
    {
        return this.connected;
    }

    private checkTable(table: string)
    {
        if (this.tables.includes(table)) return false;
        this.db.table(table);
        this.tables.push(table);
        return true;
    }

    public async set<K extends string, V>(table: string, key: K, value: V): Promise<void>
    public async set<K extends string, V>(table: DatabaseCollection<K, V>, key: K, value: V): Promise<void>
    public async set<K extends string, V>(table: string | DatabaseCollection<K, V>, key: K, value: V)
    {
        let collection: DatabaseCollection<K, V> = this.getCollection(table);
        collection.set(key, value);
        await collection.update();
    }

    public get<K extends string, V>(table: string, key: K): V | undefined;
    public get<K extends string, V>(table: DatabaseCollection<K, V>, key: K): V | undefined
    public get<K extends string, V>(table: string | DatabaseCollection<K, V>, key: K): V | undefined
    {
        let collection: DatabaseCollection<K, V> = this.getCollection(table);
        return collection.get(key);
    }

    public getOrDefault<K extends string, V>(table: string, key: K, Default?: V): V | undefined;
    public getOrDefault<K extends string, V>(table: DatabaseCollection<K, V>, key: K, Default?: V): V | undefined
    public getOrDefault<K extends string, V>(table: string | DatabaseCollection<K, V>, key: K, Default?: V): V | undefined
    {
        let collection: DatabaseCollection<K, V> = this.getCollection(table);
        return collection.get(key) ?? Default;
    }

    public find<K extends string, V>(table: string, callback: FindMethod<K, V>): V | undefined;
    public find<K extends string, V>(table: DatabaseCollection<K, V>, callback: FindMethod<K, V>): V | undefined
    public find<K extends string, V>(table: string | DatabaseCollection<K, V>, callback: FindMethod<K, V>): V | undefined
    {
        let collection: DatabaseCollection<K, V> = this.getCollection(table);
        return collection.find((v, k, c) => callback(v, k, this, c));
    } 

    public has<K extends string, V>(table: string, key: K): boolean;
    public has<K extends string, V>(table: DatabaseCollection<K, V>, key: K): boolean
    public has<K extends string, V>(table: string | DatabaseCollection<K, V>, key: K): boolean
    {
        let collection: DatabaseCollection<K, V> = this.getCollection(table);
        return collection.has(key);
    }

    public async delete<K extends string, V>(table: string, key: K): Promise<void>
    public async delete<K extends string, V>(table: DatabaseCollection<K, V>, key: K): Promise<void>
    public async delete<K extends string, V>(table: string | DatabaseCollection<K, V>, key: K)
    {
        let collection: DatabaseCollection<K, V> = this.getCollection(table);
        collection.delete(key);
        await collection.update();
    }
}