/**
 * Storage of collected arguments.
 */
interface ICollected {
    /**
     * A glob path to exclude from linting.
     */
    "--exclude"?: string;

    /**
     * Path to the file list file.
     */
    "--file-list-file"?: string;

    /**
     * A root directory to work within.
     */
    "--files-root-dir"?: string;

    /**
     * Any directories for user-created rules.
     */
    "--rules-directory"?: string;
}

/**
 * A parser and storer for command-line arguments to TSLint.MSBuild.
 */
export class ArgumentsCollection {
    /**
     * Whitelist of allowed keys from the .targets file.
     */
    private static allowedKeys: Set<string> = new Set<string>([
        "--file-list-file", "--files-root-dir", "--exclude", "--rules-directory"
    ]);

    /**
     * Keys to pass to the TSLint CLI.
     */
    private static cliKeys: Set<string> = new Set<string>([
        "--exclude", "--rules-directory"
    ]);

    /**
     * Arguments from MSBuild.
     */
    private collected: ICollected = {};

    /**
     * Collects arguments from MSBuild input.
     * 
     * @param inputs   Raw command-line input.
     * @returns this
     */
    public collectInputs(inputs: string[]): this {
        for (let i: number = 0; i < inputs.length; i += 2) {
            const key = inputs[i];
            const value = inputs[i + 1];

            if (!ArgumentsCollection.allowedKeys.has(key)) {
                throw new Error(`Unknown TSLint.MSBuild argument: '${inputs[i]}' ('${value}')`);
            }

            this.collected[key] = value;
        }

        return this;
    }

    /**
     * Logs the collected arguments.
     * 
     * @returns this
     */
    public logCollection(): this {
        for (const key in this.collected) {
            console.log(`Setting '${key}' to '${this.collected[key]}'.`);
        }

        return this;
    }

    /**
     * @returns The root directory to work within.
     */
    public getFilesRootDir(): string {
        return this.collected["--files-root-dir"];
    }

    /**
     * @returns The path to the file list file.
     */
    public getFileListFile(): string {
        return this.collected["--file-list-file"];
    }

    /**
     * Generates command-line arguments for the TSLint CLI.
     * 
     * @returns Arguments formatted for the TSLint CLI.
     */
    public toSpawnArgs(): string[] {
        const args: string[] = [];

        for (const key of ArgumentsCollection.cliKeys) {
            if (this.collected.hasOwnProperty(key)) {
                args.push(key, this.collected[key]);
            }
        }

        return args;
    }
}
