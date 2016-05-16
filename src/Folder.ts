/// <reference path="../typings/main.d.ts" />
/// <reference path="./WaitLock.ts" />

import * as fs from "fs";
import * as path from "path";
import { WaitLock } from "./WaitLock";

/**
 * A representation of a directory with files and optionally a tslint.json.
 */
export class Folder {
    /**
     * This folder's path.
     */
    private path: string;

    /**
     * Files registered under this folder.
     */
    private filePaths: string[] = [];

    /**
     * Rules list for this folder, if it exists.
     */
    private rules: any;

    /**
     * Waiter for loading the tslint.json rules 
     */
    private loadWaiter: WaitLock = new WaitLock();

    /**
     * Initializes a new instance of the Folder class.
     * 
     * @param path   The path to this folder.
     */
    constructor(path: string) {
        this.path = path;
    }

    /**
     * @returns The path to this folder.
     */
    public getPath(): string {
        return this.path;
    }

    /**
     * @returns Files registered under this folder.
     */
    public getFilePaths(): string[] {
        return this.filePaths;
    }

    /**
     * @returns Rules list for this folder, if it exists.
     */
    public getRules(): any {
        return this.rules;
    }

    /**
     * Sets the rules list for this folder.
     * 
     * @param rules   A new rules lits for this folder.
     */
    public setRules(rules: any): any {
        this.rules = rules;
        this.loadWaiter.markActionCompletion();
    }

    /**
     * Adds a file path to the list of file paths.
     * 
     * @param filePath   A path to a TypeScript file.
     */
    public addFilePath(filePath: string): void {
        this.filePaths.push(filePath);
    }

    /**
     * Loads a tslint.json from this folder.
     * 
     * @returns A Promise for whether a tslint.json was found.
     */
    public loadRules(): Promise<boolean> {
        this.loadWaiter.markActionStart();

        return new Promise(resolve => {
            fs.readFile(path.join(this.path, "tslint.json"), (error, result) => {
                if (error) {
                    this.setRules(undefined);
                    resolve(false);
                    return;
                }

                this.setRules(this.sanitizeFileContents(result));
                resolve(true);
            });
        });
    }

    /**
     * Waits for this folder to load its tslint.json.
     * 
     * @returns A Promise for this folder to load its tslint.json.
     */
    public waitForTSLint(): Promise<Folder> {
        return new Promise(resolve => {
            return this.loadWaiter.addCallback(() => resolve(this));
        });
    }

    /**
     * Sanitizes a file's contents in case of an odd BOM.
     * 
     * @param raw   Raw contents of a file.
     * @returns The BOM-sanitized equivalent text.
     */
    private sanitizeFileContents(raw: any): string {
        return JSON.parse(raw.toString().replace(/^\uFEFF/, ""));
    }
}
