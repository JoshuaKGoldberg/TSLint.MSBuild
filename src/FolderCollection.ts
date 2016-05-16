/// <reference path="../typings/main.d.ts" />

import { ArgumentsCollection } from "./ArgumentsCollection";
import { Folder } from "./Folder";

/**
 * A collection of folders, generated from individual file paths.
 */
export class FolderCollection {
    /**
     * Parsed arguments to the program.
     */
    private argumentsCollection: ArgumentsCollection;

    /**
     * Known folders that have been added.
     */
    private folders: { [i: string]: Folder } = {};

    /**
     * Initializes a new instance of the LintRunner class.
     * 
     * @param argumentsCollection   Parsed arguments to the program.
     */
    constructor(argumentsCollection: ArgumentsCollection) {
        this.argumentsCollection = argumentsCollection;
    }

    /**
     * @returns Parsed arguments to the program.
     */
    public getArgumentsCollection(): ArgumentsCollection {
        return this.argumentsCollection;
    }

    /**
     * @returns The known added folders, in sorted order.
     */
    public getFolders(): Folder[] {
        const folderPaths: string[] = Object.keys(this.folders);

        folderPaths.sort();

        return folderPaths.map(folderPath => this.folders[folderPath]);
    }

    /**
     * Adds a set of file paths, then sanitizies for tslint.jsons.
     * 
     * @param filePaths   File paths to add to the collection.
     * @returns A promise of the file paths loading their tslint.jsons.
     */
    public addFilePaths(filePaths: string[]): Promise<any> {
        return Promise
            .all(filePaths.map(filePath => this.addFilePath(filePath)))
            .then(() => this.ensureFoldersHaveRules());
    }

    /**
     * Adds a file path and its containing folder path.
     * 
     * @param filePath   A path to a file.
     * @returns A promise of the file being added.
     */
    private addFilePath(filePath: string): Promise<void> {
        return this
            .addFolderPath(this.parseParentPathFromPath(filePath))
            .then(folder => folder.addFilePath(filePath));
    }

    /**
     * Adds a folder path and checks for its tslint.json.
     * 
     * @param folderPath   A path to a folder.
     * @returns A Promise for a representation of that folder.
     */
    private addFolderPath(folderPath: string): Promise<Folder> {
        let folder = this.folders[folderPath];

        if (folder) {
            return new Promise(resolve => resolve(folder));
        }

        folder = this.folders[folderPath] = new Folder(folderPath);

        return folder
            .loadRules()
            .then(rules => this.onFolderLoad(rules, folderPath));
    }

    /**
     * Responds to a folder load, checking its parent's tslint.json if necessary.
     * 
     * @param rules   Whether the folder had its own tslint.json. 
     * @param folderPath   The path to the folder.
     * @returns A promise for the folder.
     */
    private onFolderLoad(foundRules: boolean, folderPath: string): Promise<Folder> {
        const folder: Folder = this.folders[folderPath];

        if (foundRules) {
            return new Promise(resolve => resolve(folder));
        }

        return new Promise(resolve => {
            return this
                .checkFolderParent(folderPath)
                .then(() => resolve(folder));
        });
    }

    /**
     * Checks for a folder's parent's tslint.json for a folder that doesn't
     * have its own, recursively adding parent paths.
     * 
     * @param folderPath   A path to a folder that has been loaded.
     * @returns A promise for the parent Folder, if it exists.
     * @todo Check relative to the root solution/package path?
     * @todo Should this reject instead of resolve with undefined?
     */
    private checkFolderParent(folderPath: string): Promise<Folder> {
        if (folderPath.length < this.argumentsCollection.getFilesRootDir().length) {
            return new Promise(resolve => resolve(undefined));
        }

        const folder: Folder = this.folders[folderPath];
        const parentPath: string = this.parseParentPathFromPath(folderPath);

        if (parentPath === folderPath) {
            return new Promise(resolve => resolve(undefined));
        }

        return this
            .addFolderPath(parentPath)
            .then(parentFolder => parentFolder.waitForTSLint())
            .then(parentFolder => {
                const parentTSLintRules = parentFolder.getRules();

                if (parentTSLintRules) {
                    folder.setRules(parentTSLintRules);
                }

                return parentFolder;
            });
    }

    /**
     * @todo Fix the actual issue, instead of this crappy fix...
     */
    private ensureFoldersHaveRules(): void {
        this.getFolders()
            .filter(folder => !folder.getRules())
            .forEach(folder => this.ensureFolderHasRules(folder));
    }

    /**
     * @todo Fix the actual issue, instead of this crappy fix...
     */
    private ensureFolderHasRules(folder: Folder): void {
        let currentPath: string = folder.getPath();

        while (true) {
            const parentPath: string = this.parseParentPathFromPath(currentPath);
            if (!parentPath || parentPath === currentPath) {
                return;
            }

            const ancestor: Folder = this.folders[parentPath];
            if (!ancestor || ancestor === folder) {
                return;
            }

            const rules = ancestor.getRules();
            if (rules) {
                folder.setRules(rules);
                return;
            }

            currentPath = parentPath;

            if (parentPath === ".") {
                return;
            }
        }
    }

    /**
     * @param folderPath   A path to a folder.
     * @returns The path to the folder's parent.
     * @todo Research if this is possible using the path module.
     */
    private parseParentPathFromPath(folderPath: string): string {
        const lastForwardSlashIndex: number = folderPath.lastIndexOf("/");
        const lastBackSlashIndex: number = folderPath.lastIndexOf("\\");
        const lastSlashIndex: number = Math.max(lastForwardSlashIndex, lastBackSlashIndex);
        const parentPath: string = folderPath.substring(0, lastSlashIndex);

        if (!parentPath || parentPath === folderPath) {
            return ".";
        }

        return parentPath;
    }
}
