const fs = require("fs");
const gulp = require("gulp");
const nuget = require("gulp-nuget");
const request = require("request");
const runSequence = require("run-sequence");
const msbuild = require("gulp-msbuild");

const tests = ["TSLintArgs", "TSLintCli", "TSLintOutput"];
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

gulp.task("nuget-download", callback => {
    if (fs.existsSync("nuget.exe")) {
        return callback();
    }

    request.get("http://nuget.org/nuget.exe")
        .pipe(fs.createWriteStream("nuget.exe"))
        .on("close", callback);
});


gulp.task("nuget-pack", () => {
    return gulp.src("TSLint.MSBuild.nuspec")
        .pipe(nuget.pack({
            nuget: "./nuget.exe"
        }))
        .pipe(gulp.dest("dist"));
});

gulp.task("default", ["test", "nuget-download", "nuget-pack"]);
