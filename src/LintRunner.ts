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
        this.pathToLinter = new TSLintSearcher().resolve() + "/lib/tslint-cli.js";
    }

    /**
     * Runs TSLint on the added file paths.
     * 
     * @returns A promise for TSLint errors, in alphabetical order of file path.
     */
    public runTSLint(): Promise<string[]> {
        const linter: ChildProcess = spawn(this.pathToLinter, this.argumentsCollection.generateSpawnArgs());
        const errors: string[] = [];

        return new Promise((resolve, reject) => {
            linter.stdout.on("data", (data) => {
                console.log("stdout data", data);
            });

            linter.stderr.on("data", (data) => {
                console.log("stderr data", data);
            });

            linter.on("close", (code: number) => {
                console.log(`child process exited with code ${code}`);

                // Definitely an area of work to do.
                resolve(data);
            });
        });
    }

    /**
     * Reports a failure message to a parent Promise chain.
     * 
     * @param type   The type of item that failed.
     * @param path   The path to the failed item.
     * @param error   The thrown error.
     * @returns A Promise for a failure message.
     */
    private promiseFailure(type: "file" | "folder", path: string, error: Error): Promise<string[]> {
        return new Promise(resolve => {
            resolve([`Could not lint ${type} '${path}': '${error.message}'`]);
        });
    }
}
