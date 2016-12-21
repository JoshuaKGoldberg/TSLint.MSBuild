# TSLint for MSBuild

[![NuGet Version and Downloads count](https://buildstats.info/nuget/TSLint.MSBuild)](https://www.nuget.org/packages/TSLint.MSBuild) 

An MSBuild target for linting TypeScript code using [TSLint](https://github.com/palantir/tslint). Get it at [nuget.org](https://www.nuget.org/packages/TSLint.MSBuild/).

## Usage

Add this package and [TSLint](https://nuget.org/packages/TSLint) using your NuGet Package Manager. 
It should be automatically added to your project.

TSLint's default configurations are used by default.
If you'd like to use your own `tslint.json` file, add a `TSLintConfig` property to your project:

```xml
<TSLintConfig>Scripts/tslint.json</TSLintConfig>
```

All overrideable item groups and properties are below.
Read the [TSLint documentation](https://github.com/palantir/tslint) for TSLint-specific linting details.

#### Overrideable Item Groups

<table>
    <thead>
        <tr>
            <td>Item Group</td>
            <td>Description</td>
            <td>Default</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th><code>TSLintExclude</code></th>
            <td>Globs of file names to exclude.</td>
            <td><em><code>(blank)</code></em></td>
        </tr>
        <tr>
            <th><code>TSLintRulesDirectory</code></th>
            <td>Directories for user-created rules</td>
            <td><em><code>(blank)</code></em></td>
        </tr>
    </tbody>
</table>

Note that to use special characters (such as `*` wildcards) in `TSLintExclude` you must escape the special characters.

```xml
<!-- Equivalent to "typings/**/*.d.ts" -->
<TSLintExclude Include="typings/%2A%2A/%2A.d.ts" />
```

#### Overrideable Properties

<table>
    <thead>
        <tr>
            <td>Property</td>
            <td>Description</td>
            <td>Default</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th><code>TSLintBreakBuildOnError</code></th>
            <td>Whether linting failures should break the build.</td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <th><code>TSLintConfig</code></th>
            <td>Path to a specific tslint.json.</td>
            <td><em><code>(blank)</code></em></td>
        </tr>
        <tr>
            <th><code>TSLintCli</code></th>
            <td>Path to a TSLint CLI to run with.</td>
            <td>The highest-versioned TSLint version in the solution's <code>packages</code> directory.</td>
        </tr>
        <tr>
            <th><code>TSLintDisabled</code></th>
            <td>Whether to skip running TSLint.</td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <th><code>TSLintExtraArgs</code></th>
            <td>Any extra arguments to pass to the TSLint CLI.</td>
            <td><code>(blank)</code></td>
        </tr>
        <tr>
            <th><code>TSLintNodeExe</code></th>
            <td>Path to a Node executable to execute the runner script.</td>
            <td>The <code>tools\node-7.3.0.exe</code> in the package.</td>
        </tr>
        <tr>
            <th><code>TSLintProject</code></th>
            <td>Path to a <code>tsconfig.json</code> file to use as a type checker project.</td>
            <td><em><code>(blank)</code></em></td>
        </tr>
        <tr>
            <th><code>TSLintRunOutsideBuildingProject</code></th>
            <td>Whether to run even if `BuildingProject` isn't `true`.</td>
            <td><em><code>(blank)</code></em></td>
        </tr>
        <tr>
            <th><code>TSLintTypeCheck</code></th>
            <td>Whether to enable the type checker (requires <code>TSLintProject</code> be set).</td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <th><code>TSLintVersion</code></th>
            <td>Glob filter for the version of TSLint to use <em>(ignored if <code>TSLintConfig</code> is provided)</em>.</td>
            <td><code>*.*.*</code></td>
        </tr>
    </tbody>
</table>

#### Output Item Groups

<table>
    <thead>
        <tr>
            <td>Item Group</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th><code>TSLintOutput</code></th>
            <td>Lines of console output from the TSLint CLI.</td>
        </tr>
    </tbody>
</table>

#### Output Properties

<table>
    <thead>
        <tr>
            <td>Property</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th><code>TSLintErrorCode</code></th>
            <td>Exit code of the TSLint CLI.</td>
        </tr>
    </tbody>
</table>

### TSLint version

The *first* available TSLint version in your NuGet packages directory will be used. 

### Errata

You can exclude `.d.ts` files using `<TSLintExclude Include="%2A%2A/%2A.d.ts" />`.
MSBuild escapes `*` and other special characters using `%` and their hexadecimal value.


## Development

Run the following commands to initialize your environment:

```shell
npm install
```

Run `gulp` to build.
`gulp test` just runs tests.

### Updating the version

The version number is stored both in `package.json` and `TSLint.MSBuild.nuspec`.
Make sure to update it in both places.

### 0.X to 1.X

0.X versions ran JavaScript logic to search for TSLint, run it, and wrap the output.
This was slow (running two nested Node processes, with intermediary file names in text).

1.X versions now are completely in a single MSBuild file.
This is better for performance but has two downsides:
* It no longer searches for the "highest" available TSLint version in the packages directory; instead, the first found in a file search is used.
* The `TSLintErrorSeverity` flag is no longer supported (until TSLint adds support for error levels).

Furthermore, `1.0.0` removed the TSLint NuGet package dependency.
You'll need to install it separately.

#### Why?

The original structure of TSLint.MSBuild requires multiple layers of processes calling each other, which can wreak havoc in complex managed build systems.
Then, in order:

1. MSBuild determined build settings and passed them to the JavaScript code
2. JavaScript code determined the TSLint location and re-formulated any arguments
3. JavaScript code ran TSLint via a spawned process, captured its output, and re-logged it
4. MSBuild captured the (re-logged TSLint) JavaScript output and logged it 

1.X unified all the logic into MSBuild, which resulted in significant performance gains, code simplification, and runtime stability. 
Now, in order:

1. MSBuild determines build settings and TSLint location
2. MSBuild runs TSLint using the packaged Node executable

### 0.3.X to 0.4.X

Versions 0.3.X and below manually call TSLint on individual folders, whereas 0.4.X defers to the TSLint CLI.

File a [bug report](https://github.com/JoshuaKGoldberg/TSLint.MSBuild/issues) if upgrading causes any issues.
