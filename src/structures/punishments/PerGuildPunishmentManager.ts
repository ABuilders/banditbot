/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-12 16:29:49
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 17:59:11
 */

import { Guild, GuildMember } from "discord.js";
import { BanditClient } from "../../BanditClient";
import { BanditEngine } from "../../BanditEngine";
import { DatabaseManager } from "../database/DatabaseManager";
import { PunishmentManager } from "./PunishmentManager";
import { OptionalPunishmentOptions, Punishment, PunishmentJSON, PunishmentType } from "./Punishment";
import { ExceptionalLogger } from "../ExceptionalLogger";
import { generateID, isTimedOut, isTimeoutable } from "../Utils";
import ms from "ms";

export class PerGuildPunishmentManager {

    private engine: BanditEngine;
    private client: BanditClient<true>
    private database: DatabaseManager;
    private guild: Guild;
    private dbKey: string;
    
    constructor(private punishmentsManager: PunishmentManager, guild: Guild) {
        this.engine = BanditEngine.createEngine();
        this.client = this.engine.getClient<true>(true);
        this.database = this.engine.createDatabase();
        this.guild = guild;
        this.dbKey = "punishments_" + this.guild.id;
        if (!this.database.isConnected()) throw new Error("Unable to load PerGuildPunishmentManager for guild " + guild.id + " because DatabaseManager isn't connected.");
        this.initialize().catch((err: Error) => ExceptionalLogger.getInstance().throw(err))
    }

    private async initialize() {
        this.database.initializeCollection<string, string>(this.dbKey);
    }

    async createPunishment(punishmentId: string, punishmentType: PunishmentType, moderatorId: string, memberId: string, save: boolean, optional?: OptionalPunishmentOptions): Promise<Punishment> {
        const punishment = new Punishment(punishmentId, punishmentType, moderatorId, memberId, optional);
        if (save) {
            this.database.set(this.dbKey, punishmentId, punishment.toJSON());
        }
        return punishment;
    }

    async ban(member: GuildMember, moderator: GuildMember, reason?: string): Promise<string> {
        if (member.bannable)
        {
            try {
                const bannedMember = await member.ban({
                    reason: reason,
                    deleteMessageSeconds: 604800
                });

                const punishment = await this.createPunishment(generateID("punishment"), "Ban", moderator.id, member.id, true, {
                    reason: reason
                });

                return `${member.user.username} has been banned successfully!`;

            } catch (err) {
                ExceptionalLogger.getInstance().throw(err as Error)
                return `Couldn't ban user because of an internal error.`;
            }
        }
        else
        {
            return `${member.user.username} is unbannable!`;
        }
    }

    async unban(member: GuildMember, reason?: string): Promise<string>
    {
        if (this.guild.bans.cache.has(member.id))
        {
            try
            {
                await this.guild.bans.remove(member, reason);

                return `${member.user.username} has been unbanned successfully!`;

            } catch (err)
            {
                ExceptionalLogger.getInstance().throw(err as Error)
                return `Couldn't unban user because of an internal error.`;
            }
        }
        else
        {
            return `${member.user.username} cannot be removed from banlist!`;
        }
    }

    async kick(member: GuildMember, moderator: GuildMember, reason?: string): Promise<string>
    {
        if (member.kickable)
        {
            try
            {
                const kickedMember = await member.kick(reason);

                const punishment = await this.createPunishment(generateID("punishment"), "Kick", moderator.id, member.id, true, {
                    reason: reason
                });

                return `${member.user.username} has been kicked successfully!`;


            } catch (err)
            {
                ExceptionalLogger.getInstance().throw(err as Error)
                return `Couldn't ban user because of an internal error.`;
            }
        }
        else
        {
            return `${member.user.username} is unkickable!`;
        }
    } 

    async untimeout(member: GuildMember, reason?: string): Promise<string>
    {
        if (isTimedOut(member))
        {
            try
            {
                await member.timeout(null);

                return `${member.user.username} timeout has been removed successfully!`;

            } catch (err)
            {
                ExceptionalLogger.getInstance().throw(err as Error)
                return `Couldn't untimeout user because of an internal error.`;
            }
        }
        else
        {
            return `${member.user.username} cannot be removed from timeout!`;
        }
    }

    async timeout(member: GuildMember, moderator: GuildMember, duration: ms.StringValue, reason?: string): Promise<string>
    {
        if (isTimeoutable(member))
        {
            try
            {
                const timedoutMember = await member.timeout(ms(duration), reason);

                const punishment = await this.createPunishment(generateID("punishment"), "Timeout", moderator.id, member.id, true, {
                    reason: reason,
                    duration: duration,
                    durationMS: ms(duration)
                });

                return `${member.user.username} has been timed out successfully!`;

            } catch (err)
            {
                ExceptionalLogger.getInstance().throw(err as Error)
                return `Couldn't ban user because of an internal error.`;
            }
        }
        else
        {
            return `${member.user.username} is untimeoutable!`;
        }
    }

    async removePunishment(punishmentId: string): Promise<boolean> {

        if (this.database.has(this.dbKey, punishmentId)) {
            
            await this.database.delete(this.dbKey, punishmentId);
            return true; 
        
        } else return false;

    }

    isPunishment(punishmentId: string): boolean {
        return this.database.has(this.dbKey, punishmentId);
    }

    hasPunishment(punishmentId: string, memberId: string): boolean {
        return this.database.find<string, PunishmentJSON>(this.dbKey, (v, k) => v.memberId === memberId && k === punishmentId) !== undefined;
    }

    getPunishment(punishmentId: string): Punishment | undefined {
        if (!this.isPunishment(punishmentId)) return undefined;
        const result = this.database.get<string, PunishmentJSON>(this.dbKey, punishmentId);
        if (!result) return undefined;
        return Punishment.from(result);
    }
}