# TSLint for MSBuild

[![NuGet Version and Downloads count](https://buildstats.info/nuget/TSLint.MSBuild)](https://www.nuget.org/packages/TSLint.MSBuild) 

An MSBuild target for linting TypeScript code using [TSLint](https://github.com/palantir/tslint). Get it at [nuget.org](https://www.nuget.org/packages/TSLint.MSBuild/).

## Usage

Add this package using the Visual Studio's NuGet Package Manager. 
It should be automatically added to your project.

Read the [TSLint documentation](https://github.com/palantir/tslint) for linting details.

### Builds

At runtime, the list of .ts files from your build (`TypeScriptCompile`) is output to a temporary .txt file.
A .js runner file then takes in the path to that file list, scans for `tslint.json` files, and runs TSLint on each .ts file.

The following properties may be overidden via your targets:
* **TSLintBreakBuildOnError** -  Whether linting failures should break the build. Defaults to `false`.
* **TSLintConfig** - Path to a specific tslint.json. Defaults to blank, for any tslint.json on the path.
* **TSLintErrorSeverity** - Optional MSBuild error severity override, as `"error"` or `"warning"`.
* **TSLintDeleteFileListFile** - Whether to delete the file list file when done. Defaults to `true`.
* **TSLintExclude** - Blob of matching file names to exclude. Defaults to none.
* **TSLintFilesRootDir** - Root directory to work within. Defaults to `$(MSBuildProjectDirectory)`.
* **TSLintFileListDir** - Directory to put the file list in. Defaults to `$(IntermediateOutDir)`.
* **TSLintFileListName** - Name of the file list file. Defaults to `TSLintFileList.txt-$(MSBuildProjectName)`.
* **TSLintNodeExe**: Node executable to execute the runner script. Defaults to the `tools\node-6.1.0.exe` in the package. 
* **TSLintRulesDirectory** - Comma-separated list of directories for user-created rules. Defaults to none.
* **TSLintRunnerScript** - The .js file to take in `TSLintFileListFile`. Defaults to the `tools\runner.js` in the package.

### TSLint version

The highest available TSLint version in your NuGet packages directory will be used. 


## Development

Run the following commands to initialize your environment:

```shell
npm install
typings install
```

Run `grunt` to build.

### 0.3.X to 0.4.X

Versions 0.3.X and below manually call TSLint on individual folders, whereas 0.4.X defers to the TSLint CLI.

File a [bug report](https://github.com/JoshuaKGoldberg/TSLint.MSBuild/issues) if upgrading causes any issues.
