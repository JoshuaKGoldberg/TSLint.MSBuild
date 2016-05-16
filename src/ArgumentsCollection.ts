/**
 * A parser and storer for command-line arguments to TSLint.MSBuild.
 */
export class ArgumentsCollection {
    /**
     * Value setters for arguments, keyed by alias.
     */
    private static valueSetters: { [i: string]: (value: string) => void } = {
        "exclude": ArgumentsCollection.prototype.setExclude,
        "files-root-dir": ArgumentsCollection.prototype.setFilesRootDir,
        "file-list-file": ArgumentsCollection.prototype.setFileListFile,
        "rules-directory": ArgumentsCollection.prototype.setRulesDirectories
    };

    /**
     * A glob path to exclude from linting.
     * 
     * @alias exclude
     */
    private exclude: RegExp;

    /**
     * A root directory to work within.
     * 
     * @alias files-root-dir
     */
    private filesRootDir: string;

    /**
     * The path to the file listing files to be linted.
     * 
     * @alias file-list-file
     */
    private fileListFile: string;

    /**
     * Path(s) to where rules are stored. 
     * 
     * @alias rules-directory
     */
    private rulesDirectories: string[];

    /**
     * Initializes a new instance of the ArgumentsCollection class.
     * 
     * @param inputs   Raw command-line input.
     */
    constructor(inputs: string[]) {
        for (let i: number = 0; i < inputs.length; i += 2) {
            const alias = inputs[i].replace("-", "");
            const value = inputs[i + 1];

            if (!ArgumentsCollection.valueSetters.hasOwnProperty(alias)) {
                throw new Error(`Unknown TSLint.MSBuild argument: '${inputs[i]}' '${value}'`);
            }

            console.log(`Setting '${alias}' to '${value}'.`);
            ArgumentsCollection.valueSetters[alias].call(this, value);
        }
    }

    /**
     * @returns The FilesRootDir argument.
     */
    public getFilesRootDir(): string {
        return this.filesRootDir;
    }

    /**
     * @returns The FileListFile argument.
     */
    public getFileListFile(): string {
        return this.fileListFile;
    }

    /**
     * @returns The Exclude argument.
     */
    public getExclude(): RegExp {
        return this.exclude;
    }

    /**
     * @returns The RulesDirectory argument.
     */
    public getRulesDirectories(): string[] {
        return this.rulesDirectories;
    }

    /**
     * Sets the FilesRootDir argument.
     * 
     * @param value   A new FilesRootDir value.
     */
    private setFilesRootDir(value: string): void {
        this.filesRootDir = value;
    }

    /**
     * Sets the FileListFile argument.
     * 
     * @param value   A new FileListFile value.
     */
    private setFileListFile(value: string): void {
        this.fileListFile = value;
    }

    /**
     * Sets the Exclude argument.
     * 
     * @param value   A new Exclude value.
     */
    private setExclude(value: string): void {
        this.exclude = new RegExp(value || "^$", "i");
    }

    /**
     * Sets the Exclude argument.
     * 
     * @param value   A new Exclude value.
     */
    private setRulesDirectories(value: string): void {
        this.rulesDirectories = value.split(",");
    }
}
