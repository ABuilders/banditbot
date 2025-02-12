/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-12 16:28:55
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 16:35:18
 */

import { Guild } from "discord.js";
import { BanditEngine } from "../../BanditEngine";
import { BanditClient } from "../../BanditClient";
import { PerGuildPunishmentManager } from "./PerGuildPunishmentManager";

export class PunishmentManager
{

    private static instance: PunishmentManager;

    static getInstance()
    {
        if (!this.instance) this.instance = new PunishmentManager();
        return this.instance;
    }

    private engine: BanditEngine;
    private client: BanditClient<true>;

    constructor()
    {
        this.engine = BanditEngine.createEngine();
        this.client = this.engine.getClient<true>(true)
    }

    async getPerGuild(guild: Guild | string): Promise<PerGuildPunishmentManager>
    {
        if (guild instanceof Guild)
        {
            return new PerGuildPunishmentManager(this, guild);
        } else
        {

            const clientGuild = await this.client.fetchGuild(guild);
            return new PerGuildPunishmentManager(this, clientGuild);

        }
    }
}