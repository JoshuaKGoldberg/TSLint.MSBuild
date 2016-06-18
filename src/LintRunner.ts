/// <reference path="../typings/main.d.ts" />

import { ChildProcess, spawn } from "child_process";
import { ArgumentsCollection } from "./ArgumentsCollection";
import { TSLintSearcher } from "./TSLintSearcher";

/**
 * Driver for running TSLint on a number of files.
 */
export class LintRunner {
    /**
     * Parsed MSBuild arguments.
     */
    private argumentsCollection: ArgumentsCollection;

    /**
     * Paths of files to lint.
     */
    private filePaths: string[];

    /**
     * Path of the TSLint CLI file.
     */
    private pathToLinter: any;

    /**
     * Initializes a new instance of the LintRunner class.
     * 
     * @param argumentsCollection   Parsed MSBuild arguments.
     * @param filePaths   Paths of files to lint.
     */
    constructor(argumentsCollection: ArgumentsCollection, filePaths: string[]) {
        this.argumentsCollection = argumentsCollection;
        this.filePaths = filePaths;
        this.pathToLinter = new TSLintSearcher().resolve();
    }

    /**
     * Runs TSLint on the added file paths.
     * 
     * @returns A promise for TSLint errors, in alphabetical order of file path.
     */
    public runTSLint(): Promise<string[]> {
        const linter: ChildProcess = spawn(
            "node",
            [
                this.pathToLinter,
                ...this.argumentsCollection.toSpawnArgs(),
                "--format",
                "msbuild",
                ...this.filePaths
            ]);
        const errors: string[] = [];

        return new Promise((resolve: (errors: string[]) => void, reject: (error: string) => void): void => {
            linter.stdout.on("data", (data: Buffer): void => {
                errors.push(...data.toString().trim().replace(/\\r/g, "").split("\n"));
            });

            linter.stderr.on("data", (data: Buffer): void => {
                reject(data.toString());
            });

            linter.on("close", (): void => {
                resolve(errors);
            });
        });
    }
}
