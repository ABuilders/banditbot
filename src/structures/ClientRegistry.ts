import { Collection } from "discord.js";

export class ClientRegistry<V> extends Collection<string, V> {

    private generateRandomKey(length: number = 10): string
    {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    }

    add(value: V): this
    {
        const randomKey = this.generateRandomKey();
        this.set(randomKey, value);
        return this;
    }

    addAll(...values: (V | V[])[]): this
    {
        for (const value of values)
        {
            if (Array.isArray(value))
            {
                for (const item of value)
                {
                    this.add(item);
                }
            } else
            {
                this.add(value);
            }
        }
        return this;
    }



}