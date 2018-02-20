# Updated TSLint for MSBuild

Old version seems unmaintained, that's why I forked it.

[![NuGet Version and Downloads count](https://buildstats.info/nuget/Updated.TSLint.MSBuild)](https://www.nuget.org/packages/Updated.TSLint.MSBuild) 

An MSBuild target for linting TypeScript code using [TSLint](https://github.com/palantir/tslint). Get it at [nuget.org](https://www.nuget.org/packages/Updated.TSLint.MSBuild).

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
            <th><code>TSLintInclude</code></th>
            <td>File names to lint.</td>
            <td><code>@(TypeScriptCompile)</code> <em>(unless <code>TSLintExcludeTypeScriptCompile</code> is <code>true</code>)</em></td>
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
<ItemGroup>
    <TSLintExclude Include="typings/**/*.d.ts"><Visible>False</Visible></TSLintExclude>
</ItemGroup>
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
            <td>The first TSLint version in the solution's <code>packages</code> directory, or the Project Dir's node_modules/tslint/bin/tslint directory.</td>
        </tr>
        <tr>
            <th><code>TSLintDisabled</code></th>
            <td>Whether to skip running TSLint.</td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <th><code>TSLintExcludeTypeScriptCompile</code></th>
            <td>Whether to exclude <code>@(TypeScriptCompile)</code> from <code>@(TSLintInclude)</code>.</td>
            <td><code>false</code></td>
        </tr>
        <tr>
            <th><code>TSLintExtraArgs</code></th>
            <td>Any extra arguments to pass to the TSLint CLI.</td>
            <td><code>(blank)</code></td>
        </tr>
        <tr>
            <th><code>TSLintFileListDisabled</code></th>
            <td>Whether to disable passing TypeScript file list on the command line. If true, it is expected that the files to lint are specified in the <code>TSLintProject</code> file.</td>
            <td><code>false</code></td>
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
            <th><code>TSLintTimeout</code></th>
            <td>Maximum time to run the task, in case TSLint hangs or takes too long.</td>
            <td><code>10000000</code></td>
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

## Development

Run the following commands to initialize your environment:

```shell
npm install -g gulp
npm install
```

Run `gulp` to build.
`gulp test` just runs tests.

### Updating the version

The version number is stored both in `package.json` and `TSLint.MSBuild.nuspec`.
Make sure to update it in both places.

File a [bug report](https://github.com/isc30/TSLint.MSBuild/issues) if upgrading causes any issues.
