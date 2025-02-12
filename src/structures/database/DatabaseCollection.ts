/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-11 19:28:00
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 14:52:21
 */

import { Collection } from "discord.js";
import { DatabaseManager } from "./DatabaseManager";
import { QuickDB } from "quick.db";

export class DatabaseCollection<K extends string, V> extends Collection<K, V>
{

    private table: QuickDB;
    private mainDB: QuickDB;
    private db: DatabaseManager;

    constructor(private database: DatabaseManager, table: string)
    {
        super();
        this.db = database;
        this.mainDB = database.getQuickDatabase();
        this.table = this.mainDB.table(table);
        this.initialize();
    }

    async initialize()
    {

        const allKeys = await this.table.all()

        for (const { id, value } of allKeys)
        {
            this.set(id as K, value);
        }

    }

    async update()
    {

        for (const [key, value] of this.entries())
        {
            await this.table.set(key, value);
        }

    }

}