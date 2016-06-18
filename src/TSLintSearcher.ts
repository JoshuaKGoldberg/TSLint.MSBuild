/// <reference path="../typings/main.d.ts" />

import * as fs from "fs";
import * as path from "path";

/**
 * The folder name NuGet packages are stored under.
 */
const packagesFolderName: string = "packages";

/**
 * Where the node module is stored under its NuGet package.
 */
const pathSuffix: string = "tools/node_modules/tslint";

/**
 * Known names of environment variables that build systems may put packages in.
 */
const possibleEnvironmentVariables: string[] = [
    "NugetMachineInstallRoot"
];

/**
 * A utility to find a TSLint NuGet package.
 */
export class TSLintSearcher {
    /**
     * The parent project's NuGet packages folder.
     */
    private packagesDirectory: string;

    /**
     * The highest available version of the TSLint NuGet package.
     */
    private tsLintPackage: string;

    /**
     * Initializes a new instance of the TSLintSearcher class.
     */
    constructor() {
        this.packagesDirectory = this.resolvePackagesDirectory();
        console.log(`Resolved packages directory to '${this.packagesDirectory}'.`);

        this.tsLintPackage = this.resolveTSLintPackageDirectory();
        console.log(`Resolved TSLint package directory to '${this.tsLintPackage}'.`);
    }

    /**
     * @returns The complete path to the TSLint package.
     */
    public resolve(): string {
        const packagePath: string = path.resolve(
            this.packagesDirectory,
            this.tsLintPackage,
            pathSuffix);
        const cliPath = path.join(packagePath, "lib", "tslint-cli.js");
        console.log(`Resolved TSLint CLI to '${cliPath}'.`);

        return cliPath;
    }

    /**
     * @returns The parent project's NuGet packages folder.
     */
    private resolvePackagesDirectory(): string {
        console.log("Resolving packages directory...");

        const result: string = (
            this.resolvePackagesDirectoryFromSibling()
            || this.resolvePackagesDirectoryFromEnvironment()
            || this.resolvePackagesDirectoryFromParent());

        if (!result) {
            throw new Error("Couldn't find TSLint packages directory!");
        }

        return result;
    }

    /**
     * Attempts to find the NuGet package directory as a sibling of the current
     * directory.
     * 
     * @returns The NuGet package directory path, if found.
     */
    private resolvePackagesDirectoryFromSibling(): string {
        console.log("Resolving packages directory from siblings...");

        const currentPath: string = path.resolve(__dirname, "../..");
        if (this.doesFolderContainTSLint(currentPath)) {
            return currentPath;
        }

        console.log(`No TSLint found in '${currentPath}'.`);
        return undefined;
    }

    /**
     * Attempts to find the NuGet package directory based on known environment
     * variables.
     * 
     * @returns The NuGet package directory path, if found.
     */
    private resolvePackagesDirectoryFromEnvironment(): string {
        console.log("Resolving packages directory from environment...");

        for (let i: number = 0; i < possibleEnvironmentVariables.length; i += 1) {
            const name: string = possibleEnvironmentVariables[i];
            if (!process.env[name]) {
                continue;
            }

            const value: string = process.env[name];
            const  currentPath: string = path.resolve(value);
            console.log(`Checking environment variable path '${name}' (value '${value}' resolved to '${currentPath}')...`);

            if (this.doesFolderContainTSLint(currentPath)) {
                return currentPath;
            }
        }

        console.log("No matching environment variable paths found.");
    }

    /**
     * Attempts to find the NuGet package directory as a parent of the current
     * directory.
     * 
     * @returns The NuGet package directory path, if found.
     */
    private resolvePackagesDirectoryFromParent(): string {
        console.log("Resolving packages directory from parent...");

        let currentPath: string = path.resolve(__dirname, "..");

        while (true) {
            if (currentPath.length < 3) {
                console.log("Too far up to find packages directory.");
                return;
            }

            console.log(`\tChecking '${currentPath}'...`);

            let childNames: string[] = fs.readdirSync(currentPath);
            if (childNames.indexOf(packagesFolderName) !== -1) {
                currentPath = path.resolve(currentPath, packagesFolderName);
                break;
            }

            let nextPath = path.resolve(currentPath, "..");
            if (currentPath === nextPath) {
                console.log("Could not find \"packages\" directory from parents.");
                return undefined;
            }

            currentPath = nextPath;
        }

        return currentPath;
    }

    /**
     * Determines the highest version of the TSLint NuGet package in the 
     * previously determined packages directory.
     * 
     * @returns The highest version of the TSLint NuGet package.
     */
    private resolveTSLintPackageDirectory(): string {
        console.log("Resolving TSLint package directory...");

        let lintVersions: number[][] = fs.readdirSync(this.packagesDirectory)
            .filter(folderName => this.folderIsTSLint(folderName))
            .map(folderName => this.parseTSLintPackageVersionFromName(folderName));

        if (lintVersions.length === 0) {
            throw new Error("Couldn't find a TSLint package.");
        }

        lintVersions.sort(TSLintSearcher.versionSorter);
        console.log(`\tFound TSLint versions [${this.joinLintVersions(lintVersions)}].`);

        return `tslint.${lintVersions[0].join(".")}`;
    }

    /**
     * @param folderName   The name of a TSLint folder.
     * @returns The semver associated with that name.
     */
    private parseTSLintPackageVersionFromName(folderName: string): number[] {
        return folderName
            .replace("tslint", "")
            .split(".")
            .filter(numberRaw => !!numberRaw)
            .map(numberRaw => parseInt(numberRaw));
    }

    /**
     * @param lintVersions   Found versions of a package.
     * @returns A human-readable list of the given versions.
     */
    private joinLintVersions(lintVersions: number[][]): string {
        return lintVersions.map(lintVersion => lintVersion.join(".")).join(",");
    }

    /**
     * Determines if a folder's children contain a TSLint directory.
     * 
     * @param folderPath   A path to a folder.
     * @returns Whether the folder contains a TSLint child.
     */
    private doesFolderContainTSLint(folderPath: string) {
        const childNames: string[] = fs.readdirSync(folderPath);

        for (let i: number = 0; i < childNames.length; i += 1) {
            if (this.folderIsTSLint(childNames[i])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determines whether a folder contains the TSLint NuGet package.
     * 
     * @param folderName   A folder to check.
     * @returns Whether the folderName is a match for TSLint.
     */
    private folderIsTSLint(folderName: string): boolean {
        return /tslint.\b\d+.\d+.\d+\b/.test(folderName);
    }

    /**
     * Sorts semver versions of a package.
     * 
     * @param a   A semver version of a package.
     * @param b   A semver version of a package.
     * @returns Whether a is less than b.
     */
    private static versionSorter(a: number[], b: number[]): number {
        const minimumLength = Math.min(a.length, b.length);

        for (let i: number = 0; i < minimumLength; i += 1) {
            if (a[i] !== b[i]) {
                return a[i] > b[i] ? -1 : 1;
            }
        }

        return a.length > b.length ? -1 : 1;
    }
}
