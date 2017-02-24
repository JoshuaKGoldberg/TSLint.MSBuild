const gulp = require("gulp");

const tests = ["TSLintArgs", "TSLintCli", "TSLintCliLocalTSLint", "TSLintOutput", "TSLintVersion", "TSLintFileListDisabled"];
const testTasks = tests.map(testName => `test:${testName}`);

tests.forEach(testName => {
    const msbuild = require("gulp-msbuild");

    gulp.task(`test:${testName}`, () => {
        return gulp.src(`./test/${testName}/${testName}.sln`)
            .pipe(msbuild({
                configuration: "Debug",
                stdout: true
            }));
    });
});

gulp.task("test", callback => {
    const runSequence = require("run-sequence");

    runSequence(...testTasks, callback);
});

gulp.task("nuget-download", callback => {
    const fs = require("fs");
    const request = require("request");

    if (fs.existsSync("nuget.exe")) {
        callback();
        return;
    }

    request.get("http://nuget.org/nuget.exe")
        .pipe(fs.createWriteStream("nuget.exe"))
        .on("close", () => {
            if (fs.statSync("nuget.exe").size <= 0) {
                throw new Error([
                    "Could not download nuget.exe from http://nuget.org/nuget.exe.",
                    "Try downloading it to " + __dirname + " manually."
                ].join(" "));
            }

            callback();
        });
});


gulp.task("nuget-pack", () => {
    const nuget = require("gulp-nuget");

    return gulp.src("TSLint.MSBuild.nuspec")
        .pipe(nuget.pack({
            nuget: "./nuget.exe"
        }))
        .pipe(gulp.dest("dist"));
});

gulp.task("default", ["test", "nuget-download", "nuget-pack"]);
