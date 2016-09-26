const gulp = require("gulp");
const merge = require("merge2");
const msbuild = require("gulp-msbuild");

gulp.task("test", () => {
    const tests = ["TSLintArgs", "TSLintCli"]
        .map(testName => gulp.src(`./test/${testName}/${testName}.sln`)
            .pipe(msbuild({
                configuration: "Debug",
                stdout: true
            })));

    return merge(tests);
});