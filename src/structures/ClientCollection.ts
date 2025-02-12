/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-11 19:35:04
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 15:03:44
 */

import { Collection } from "discord.js";

type EntryType<K extends keyof any, V> = [K, V] | [K, V][] | Record<K, V>;

/**
 * Extended Collection class with additional utility methods
 */
export class ClientCollection<K extends keyof any, V> extends Collection<K, V>
{
    /**
     * Adds multiple entries to the collection
     * @param entries Array of entries in various formats
     * @throws {TypeError} If entry format is invalid
     */
    addAll(...entries: EntryType<K, V>[]): this
    {
        for (const entry of entries)
        {
            try
            {
                if (Array.isArray(entry))
                {
                    if (Array.isArray(entry[0]))
                    {
                        // Handle array of [key, value] pairs
                        (entry as [K, V][]).forEach(([key, value]) =>
                        {
                            this.set(key, value);
                        });
                    } else
                    {
                        // Handle single [key, value] tuple
                        const [key, value] = entry as [K, V];
                        this.set(key, value);
                    }
                } else if (entry && typeof entry === 'object')
                {
                    // Handle Record<K, V>
                    Object.entries(entry).forEach(([key, value]) =>
                    {
                        this.set(key as K, value as V);
                    });
                } else
                {
                    throw new TypeError(`Invalid entry format: ${String(entry)}`);
                }
            } catch (error)
            {
                if (error instanceof Error)
                {
                    console.error(`Error adding entry: ${error.message}`);
                }
                throw error;
            }
        }
        return this;
    }

    /**
     * Updates multiple entries in the collection
     * @param entries Entries to update
     * @param upsert Whether to add entries if they don't exist
     */
    updateAll(entries: Array<[K, V]>, upsert = false): this
    {
        entries.forEach(([key, value]) =>
        {
            if (this.has(key) || upsert)
            {
                this.set(key, value);
            }
        });
        return this;
    }

    /**
     * Removes multiple entries from the collection
     * @param keys Keys to remove
     */
    removeAll(...keys: K[]): this
    {
        keys.forEach(key => this.delete(key));
        return this;
    }

    /**
     * Gets multiple entries from the collection
     * @param keys Keys to get
     * @returns Array of values
     */
    getAll(...keys: K[]): V[]
    {
        return keys.map(key => this.get(key)).filter((value): value is V => value !== undefined);
    }

    /**
     * Checks if all keys exist in the collection
     * @param keys Keys to check
     */
    hasAll(...keys: K[]): boolean
    {
        return keys.every(key => this.has(key));
    }

    /**
     * Maps over the collection with async function support
     * @param fn Mapping function
     */
    async mapAsync<T>(fn: (value: V, key: K, collection: this) => Promise<T>): Promise<T[]>
    {
        const promises = Array.from(this.entries()).map(([key, value]) => fn(value, key, this));
        return Promise.all(promises);
    }

    /**
     * Filters the collection into a new ClientCollection
     * @param fn Filter function
     */
    filterInto(fn: (value: V, key: K, collection: this) => boolean): ClientCollection<K, V>
    {
        const filtered = new ClientCollection<K, V>();
        this.forEach((value, key) =>
        {
            if (fn(value, key, this))
            {
                filtered.set(key, value);
            }
        });
        return filtered;
    }

    /**
     * Creates a deep clone of the collection
     */
    clone(): ClientCollection<K, V>
    {
        return new ClientCollection<K, V>(this);
    }

    /**
     * Converts the collection to a plain object
     */
    toObject(): Record<string & K, V>
    {
        return Object.fromEntries(this) as Record<string & K, V>;
    }

    /**
     * Creates a collection from a plain object
     * @param obj Object to convert
     */
    static fromObject<K extends keyof any, V>(obj: Record<K, V>): ClientCollection<K, V>
    {
        return new ClientCollection<K, V>(Object.entries(obj) as [K, V][]);
    }

    getIndex(index: number): [K, V] | undefined {
        const keyIndex = this.keyAt(index);
        if (!keyIndex) return undefined;
        const valueIndex = this.get(keyIndex);
        if (!valueIndex) return undefined;
        return [keyIndex, valueIndex];
    } 
}