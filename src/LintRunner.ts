/// <reference path="../typings/main.d.ts" />

import * as fs from "fs";
import { ArgumentsCollection } from "./ArgumentsCollection";
import { Folder } from "./Folder";
import { FolderCollection } from "./FolderCollection";
import { TSLintSearcher } from "./TSLintSearcher";

/**
 * Driver for running TSLint on a number of files.
 */
export class LintRunner {
    /**
     * Folders generated from individual file paths.
     */
    private folders: FolderCollection;

    /**
     * A utility to find the TSLint NuGet package location.
     */
    private tsLintSearcher: TSLintSearcher;

    /**
     * The TSLint module to be required.
     */
    private tsLint: any;

    /**
     * Initializes a new instance of the LintRunner class.
     * 
     * @param argumentsCollection   Parsed arguments to the program.
     */
    constructor(argumentsCollection: ArgumentsCollection) {
        this.folders = new FolderCollection(argumentsCollection);
        this.tsLintSearcher = new TSLintSearcher();
        this.tsLint = require(this.tsLintSearcher.resolve());
    }

    /**
     * Adds a list of file paths to the folder collection.
     * 
     * @param filePaths   File paths to add to the folder collection.
     * @returns A promise of the folder's files loading their tslint.jsons.
     */
    public addFilePaths(filePaths: string[]): Promise<any> {
        return this.folders.addFilePaths(
            filePaths.map((filePath: string): string => fs.realpathSync(filePath)));
    }

    /**
     * Runs TSLint on the added file paths.
     * 
     * @returns A promise for TSLint errors, in alphabetic order of file path.
     */
    public runTSLint(): Promise<string[]> {
        const folders: Folder[] = this.folders.getFolders();
        const lintPromises = folders
                .map(folder => {
                    try {
                        return this.lintFolder(folder);
                    } catch (error) {
                        return this.promiseFailure("folder", folder.getPath(), error);
                    }
                });

        return Promise.all(lintPromises).then(errors => [].concat.apply([], errors));
    }

    /**
     * Runs TSLint on a folder's files.
     * 
     * @param folder   A folder whose files should be linted.
     * @returns A promise for TSLint errors, in alphabetic order of file path.
     */
    private lintFolder(folder: Folder): Promise<string[]> {
        const rules: any = folder.getRules();
        const options = this.generateFolderOptions(rules);

        if (!rules) {
            throw new Error(`No tslint.json available for '${folder.getPath()}'`);
        }

        const filePromises: Promise<string[]>[] = folder
            .getFilePaths()
            .map(filePath => {
                try {
                    return this.lintFile(filePath, options);
                } catch (error) {
                    return this.promiseFailure("file", filePath, error);
                }
            });

        return Promise.all(filePromises).then(errors => [].concat.apply([], errors));
    }

    /**
     * Runs TSLint on a file.
     * 
     * @param filePath   The path to the file.
     * @param options   Overall options for linting.
     * @returns A promise for TSLint errors, in alphabetic order of file path.
     */
    private lintFile(filePath: string, options: any): Promise<string[]> {
        return new Promise(resolve => {
            fs.readFile(filePath, (error, result) => {
                if (error) {
                    resolve([`Failure reading '${filePath}': ${error.toString()}`]);
                    return;
                }

                try {
                    const linter = new this.tsLint(filePath, result.toString(), options);
                    const errorSummary = linter.lint();

                    resolve(JSON.parse(errorSummary.output));
                } catch (error) {
                    resolve([`Could not lint '${filePath}': ${error.toString()}`]);
                }
            });
        });
    }

    /**
     * Generates options to be passed into a Linter.
     * 
     * @param rules   Linting rules for a folder.
     * @returns Options to be passed into a Linter.
     */
    private generateFolderOptions(rules: any): any {
        const options: any = {
            formatter: "json",
            configuration: rules
        };

        const rulesDirectories: string[] = this.folders.getArgumentsCollection().getRulesDirectories();

        if (rulesDirectories !== undefined && rulesDirectories.length > 0) {
            options.rulesDirectory = rulesDirectories;
        }

        return options;
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
