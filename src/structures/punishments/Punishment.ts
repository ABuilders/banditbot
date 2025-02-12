export type PunishmentType = "Ban" | "Timeout" | "Kick"

export interface OptionalPunishmentOptions {
    duration?: string;
    durationMS?: number;
    reason?: string;
}

export interface PunishmentJSON {
    punishmentId: string,
    punishmentType: string,
    moderatorId: string,
    memberId: string,
    duration?: string,
    durationMS?: number,
    reason?: string,
}

export class Punishment {

    static from(json: PunishmentJSON): Punishment {

        return new Punishment(json.punishmentId, json.punishmentType as PunishmentType, json.moderatorId, json.memberId, {
            duration: json.duration,
            durationMS: json.durationMS,
            reason: json.reason
        })

    }

    constructor(private punishmentId: string, private punishmentType: PunishmentType, private moderatorId: string, private memberId: string, private optional?: OptionalPunishmentOptions) {}

    getOptional() {
        return this.optional ?? {}
    }

    getModeratorID() {
        return this.moderatorId;
    }

    getMemberID() {
        return this.memberId;
    }

    getReason() {
        return this.getOptional().reason ?? "No reason was found."
    }

    getDuration() {
        return this.getOptional().duration ?? "-1s"
    }
    
    getDurationMS() {
        return this.getOptional().durationMS ?? -1;
    }

    getPunishmentID() {
        return this.punishmentId;
    }

    getPunishmentType() {
        return this.punishmentType;
    }

    toJSON(): PunishmentJSON {
        return {
            punishmentId: this.punishmentId,
            punishmentType: this.punishmentType,
            moderatorId: this.moderatorId,
            memberId: this.memberId,
            ...this.getOptional()
        }
    }

}