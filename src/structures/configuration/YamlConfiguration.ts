/**
 * @ Author: AbdullahCXD
 * @ Create Time: 2025-02-11 19:30:34
 * @ Modified by: AbdullahCXD
 * @ Modified time: 2025-02-12 14:53:51
 */

import YAML from "yaml";
import { YamlSchema } from "../../typings";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { ClientCollection } from "../ClientCollection";

export interface YamlConfigurationOptions {
    createIfNotExists?: boolean;
    defaultContent?: string;
}

/**
 * A type-safe YAML configuration manager that extends ClientCollection
 * @template S The schema type for the YAML configuration
 */
export class YamlConfiguration<S extends Record<string, any>> extends ClientCollection<keyof S, S[keyof S]>
{
    static stringify<S>(schema: S): string {
        return YAML.stringify(schema);
    }

    private readonly schema: YamlSchema<S>;
    private content: string;
    private readonly configsPath: string;
    private readonly fullPath: string;

    /**
     * Creates a new YAML configuration manager
     * @param file The YAML file name or path relative to the configurations directory
     * @param options Configuration options
     * @throws {Error} If the YAML file cannot be found or parsed
     */
    constructor(
        private readonly file: string,
        options: YamlConfigurationOptions = {}
    )
    {
        super();

        try
        {
            // Initialize paths
            this.configsPath = path.join(process.cwd(), "configurations");
            this.fullPath = path.join(this.configsPath, file);

            // Create directory if it doesn't exist
            if (!existsSync(this.configsPath))
            {
                mkdirSync(this.configsPath, { recursive: true });
            }

            // Handle file existence
            if (!existsSync(this.fullPath))
            {
                if (options.createIfNotExists)
                {
                    writeFileSync(this.fullPath, options.defaultContent ?? "", "utf8");
                } else
                {
                    throw new Error(`YAML Configuration not found at: ${this.fullPath}`);
                }
            }

            // Read and parse content
            this.content = readFileSync(this.fullPath, "utf8");
            this.schema = YAML.parse(this.content) as YamlSchema<S>;

            // Validate schema
            if (!this.schema || typeof this.schema !== 'object')
            {
                throw new Error('Invalid YAML schema: must be an object');
            }

            // Initialize collection
            this.addAll(this.schema);
        } catch (error)
        {
            throw new Error(`Failed to initialize YAML configuration: ${error instanceof Error ? error.message : 'Unknown error'
                }`);
        }
    }

    /**
     * Saves the current configuration back to the YAML file
     * @throws {Error} If the file cannot be written
     */
    save(): void
    {
        try
        {
            const content = YAML.stringify(this.toObject());
            writeFileSync(this.fullPath, content, "utf8");
            this.content = content;
        } catch (error)
        {
            throw new Error(`Failed to save YAML configuration: ${error instanceof Error ? error.message : 'Unknown error'
                }`);
        }
    }

    /**
     * Reloads the configuration from the YAML file
     * @throws {Error} If the file cannot be read or parsed
     */
    reload(): void
    {
        try
        {
            this.content = readFileSync(this.fullPath, "utf8");
            this.clear();
            const newSchema = YAML.parse(this.content) as YamlSchema<S>;
            this.addAll(newSchema);
        } catch (error)
        {
            throw new Error(`Failed to reload YAML configuration: ${error instanceof Error ? error.message : 'Unknown error'
                }`);
        }
    }

    /**
     * Gets the raw content of the YAML file
     */
    getRawContent(): string
    {
        return this.content;
    }

    /**
     * Gets the full path to the YAML file
     */
    getFilePath(): string
    {
        return this.fullPath;
    }

    /**
     * Updates a value in the configuration and optionally saves it
     * @param key The key to update
     * @param value The new value
     * @param save Whether to save the changes to file
     */
    setValue(key: keyof S, value: S[keyof S], save = false): this
    {
        this.set(key, value);
        if (save)
        {
            this.save();
        }
        return this;
    }

    /**
     * Updates multiple values in the configuration and optionally saves them
     * @param entries The key-value pairs to update
     * @param save Whether to save the changes to file
     */
    setValues(entries: Array<[keyof S, S[keyof S]]>, save = false): this
    {
        this.updateAll(entries, true);
        if (save)
        {
            this.save();
        }
        return this;
    }
}