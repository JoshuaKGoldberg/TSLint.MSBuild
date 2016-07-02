/**
 * MSBuild error printers, keyed by severity level.
 */
interface IErrorPrinters {
    [i: string]: IErrorPrinter;
}

/**
 * Prints a single pre-formatted MSBuild error.
 * 
 * @param error   A pre-formatted MSBuild error.
 */
interface IErrorPrinter {
    (error: string): void;
}

/**
 * Prints MSBuild errors from the TSLint CLI with a severity level.
 */
export class ErrorsPrinter {
    /**
     * MSBuild error printers, keyed by severity level.
     */
    private errorPrinters: IErrorPrinters = {
        error: (error: string): void => console.error(error),
        warning: (error: string): void => console.warn(error)
    };

    /**
     * Overridden severity level for errors, if provided.
     */
    private severityOverride: string;

    /**
     * Initializes a new instance of the ErrorsPrinter class.
     * 
     * @param severityOverride   Overridden severity level for errors, if provided.
     */
    public constructor(severityOverride?: string) {
        this.severityOverride = severityOverride;
    }

    /**
     * Prints MSBuild errors.
     * 
     * @param errors   MSBuild errors.
     */
    public print(errors: string[]): void {
        for (const error of errors) {
            this.printError(error);
        }
    }

    /**
     * Prints an MSBuild error.
     * 
     * @param error   An MSBuild error.
     */
    public printError(error: string): void {
        const errorSeverity = this.getSeverityFromError(error);

        if (this.severityOverride && this.severityOverride !== errorSeverity) {
            error = this.replaceErrorSeverity(error, errorSeverity, this.severityOverride);
        }

        const severity = this.severityOverride || errorSeverity;
        const printer = this.errorPrinters[severity];

        if (!printer) {
            throw new Error(`Unknown error severity: '${severity}'.`);
        }

        printer(error);
    }

    /**
     * @param error   An MSBuild error.
     * @returns The error's severity.
     */
    private getSeverityFromError(error: string): string {
        return error
            .match(/\):\s.+:/)
            [0]
            .replace(/\W/g, "");
    }

    /**
     * Replaces an error's severity with a new severity.
     * 
     * @param error   An MSBuild error.
     * @param originalSeverity   The current severity level of the error.
     * @param newSeverity   A new severity level for the error.
     * @returns A copy of the error with thenew severity level.
     */
    private replaceErrorSeverity(error: string, originalSeverity: string, newSeverity: string): string {
        return error.replace(
            this.wrapErrorFormat(originalSeverity),
            this.wrapErrorFormat(newSeverity));
    }

    /**
     * Wraps a severity string with find-and-replace safe markers.
     * 
     * @param severity   A severity level.
     * @returns The severity with find-and-replace safe markers.
     */
    private wrapErrorFormat(severity: string): string {
        return `): ${severity}`;
    }
}