/// <reference path="../typings/main.d.ts" />

console.log("Starting TSLint runner.");

import * as fs from "fs";
import * as path from "path";
import { ArgumentsCollection } from "./ArgumentsCollection";
import { LintRunner } from "./LintRunner";

/**
 * Retrieves the list of input .ts files from a text file. 
 * 
 * @param filePath   A file path to a text file.
 * @returns A list of input .ts files.
 */
function getInputFilesList(filePath): string[] {
    return fs.readFileSync(filePath)
        .toString()
        .replace(/\r/g, "")
        .split("\n")
        .filter(file => !!file);
}

(() => {
    const argumentsCollection: ArgumentsCollection = new ArgumentsCollection()
        .collectInputs(process.argv.slice(2))
        .logCollection();
    const rootDirectory: string = argumentsCollection.getFilesRootDir();
    const summaryFilePath: string = argumentsCollection.getFileListFile();
    const filePaths: string[] = getInputFilesList(summaryFilePath);
    const runner = new LintRunner(argumentsCollection, filePaths);

    console.log(`Running TSLint on ${filePaths.length} file(s).`);

    runner.runTSLint()
        .then(lintErrors => {
            const numErrors = lintErrors.match(/\n/g).length;

            if (numErrors !== 0) {
                console.error(lintErrors);
            }

            console.log(`${numErrors} error(s) found in ${filePaths.length} file(s).`);
        })
        .catch(error => {
            console.error("Error running TSLint!");
            console.error(error.toString());
        });
})();
