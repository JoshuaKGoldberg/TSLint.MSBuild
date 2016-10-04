const gulp = require("gulp");
const runSequence = require("run-sequence");
const msbuild = require("gulp-msbuild");

const tests = ["TSLintArgs", "TSLintCli", "TSLintErrorSeverity", "TSLintOutput"];
const testTasks = tests.map(testName => `test:${testName}`);

tests.forEach(testName => {
    gulp.task(`test:${testName}`, () => {
        return gulp.src(`./test/${testName}/${testName}.sln`)
            .pipe(msbuild({
                configuration: "Debug",
                stdout: true
            }));
    });
});

gulp.task("test", callback => runSequence(...testTasks, callback));

gulp.task("default", ["test"]);
