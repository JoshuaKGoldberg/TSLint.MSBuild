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

Overrideable properties:
* **TSLintBreakBuildOnError** -  Whether linting failures should break the build. Defaults to `false`.
* **TSLintConfig** - Path to a specific tslint.json. Defaults to blank, for any tslint.json on the path.
* **TSLintCli** - Path to a TSLint CLI to run with. Defaults to the highest-versioned TSLint version in the solution's `packages` directory.
* **TSLintDisabled** - Whether to skip running TSLint. Defaults to false.
* **TSLintErrorSeverity** - Optional MSBuild error severity override, as `"error"` or `"warning"`.
* **TSLintNodeExe**: Path to a Node executable to execute the runner script. Defaults to the `tools\node-6.1.0.exe` in the package. 

Overrideable items:
* **TSLintExclude** - Globs of file names to exclude. Defaults to none.
* **TSLintRulesDirectory** - Directories for user-created rules. Defaults to none.

Output Properties:
* **TSLintOutput** - Console output of the TSLint CLI.
* **TSLintErrorCode** Exit code of the TSLint CLI. 

### TSLint version

The *first* available TSLint version in your NuGet packages directory will be used. 


## Development

Run the following commands to initialize your environment:

```shell
npm install
```

Run `gulp` to build.

### 0.X to 1.X

Crazy stuff happened.
Everything's broken.
Oh.

This no longer searches for the "highest" available TSLint version in the packages directory; instead, the first found in a file search is used.

#### Why?

The original schema of TSLint.MSBuild requires multiple layers of processes calling each other, which can wreak havoc in complex managed build systems.

1. MSBuild determines build settings and passes them to the JavaScript code
2. JavaScript code determines the TSLint location and re-formulates arguments
3. JavaScript code runs TSLint via a spawned process, captures its output, and re-logs it
4. MSBuild captures the (re-logged TSLint ) JavaScript output and logs it 

1.X unified all the logic into MSBuild, which resulted in significant performance gains, code simplification, and runtime stability. 

1. MSBuild determines build settings and TSLint location
2. MSBuild runs TSLint using the packaged Node executable, captures its output, and re-logs it

### 0.3.X to 0.4.X

Versions 0.3.X and below manually call TSLint on individual folders, whereas 0.4.X defers to the TSLint CLI.

File a [bug report](https://github.com/JoshuaKGoldberg/TSLint.MSBuild/issues) if upgrading causes any issues.
