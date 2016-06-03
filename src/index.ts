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

/**
 * Formats a TSLint error for display in Visual Studio.
 * 
 * @param lintError   Either a TSLint violation POJO or an error String.
 * @todo Use tslint.d.ts for a type definition.
 */
function formatOutput(lintError: string | any): string {
    if (typeof lintError === "string") {
        return lintError;
    }

    return lintError.name.replace(/\//g, "\\")
        + `(${(lintError.startPosition.line + 1)},${(lintError.startPosition.character + 1)})`
        + `: error tslint-${lintError.ruleName}`
        + `: TSLint failure: ${lintError.failure}.`;
}

(() => {
    const argumentsCollection: ArgumentsCollection = new ArgumentsCollection(process.argv.slice(2));
    const rootDirectory: string = argumentsCollection.getFilesRootDir();
    const summaryFilePath: string = argumentsCollection.getFileListFile();
    const filePaths: string[] = getInputFilesList(summaryFilePath);
    const filePathsIncluded: string[] = filePaths.filter(
            filePath => !argumentsCollection.getExclude().test(filePath));
    const runner = new LintRunner(argumentsCollection);

    console.log(`Running TSLint on ${filePathsIncluded.length} of ${filePaths.length} file(s) (excluding ${filePaths.length - filePathsIncluded.length}).`);

    runner
        .addFilePaths(filePathsIncluded)
        .then(() => runner.runTSLint())
        .then(lintErrors => {
            if (lintErrors.length === 0) {
                console.log(`0 errors found in ${filePathsIncluded.length} file(s).`);
                return;
            }

            const lintErrorsFormatted = lintErrors
                .map(lintError => formatOutput(lintError))
                .join("\n");

            console.error(lintErrorsFormatted);
            console.log(`${lintErrors.length} error(s) found in ${filePathsIncluded.length} file(s).`);
        })
        .catch(error => {
            console.error("Error running TSLint!");
            console.error(error.toString());
        });
})();
