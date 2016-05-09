# TSLint for MSBuild

An MSBuild target for linting TypeScript code using [TSLint](https://github.com/palantir/tslint). Get it at [nuget.org](https://www.nuget.org/packages/TSLint.MSBuild/).

## Usage

Add this package using the Visual Studio's NuGet Package Manager. 
It should be automatically added to your project.

### Builds

At runtime, the list of .ts files from your build (`TypeScriptCompile`) is output to a temporary .txt file.
A .js runner file then takes in the path to that file list, scans for `tslint.json` files, and runs TSLint on each .ts file.

The following properties may be overidden via your targets:
* **TSLintDeleteFileListFile** - Whether to delete the file list file when done. Defaults to `true`.
* **TSLintExclude** - A JavaScript RegExp literal of matching file names to exclude. Defaults to `"^$"` (none).
* **TSLintIgnoreExitCode** - Whether linting failures should be ignored (not break the build). Defaults to `true`.
* **TSLintFilesRootDir** - A root directory to work within. Defaults to `$(MSBuildProjectDirectory)`.
* **TSLintFileListDir** - The directory to put the file list in. Defaults to `$(IntermediateOutDir)`.
* **TSLintFileListName** - The name of the file list file. Defaults to `TSLintFileList.txt-$(MSBuildProjectName)`.
* **TSLintNodeExe**: A node executable to execute the runner script. Defaults to the `tools\node-5.9.0.exe` in the package. 
* **TSLintRunnerScript** - The .js file to take in `TSLintFileListFile`. Defaults to the `tools\runner.js` in the package.


### tslint.json

TSLint.MSBuild respects `tslint.json` settings in directories.
Placing a `tslint.json` in a directory will affect that directory's children and all subdirectory children, unless superseded by another `tslint.json`. 


## Development

Run the following commands to initialize your environment:

```shell
npm install
typings install
```

Run `grunt` to build.
