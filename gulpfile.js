var gulp = require("gulp");
var msbuild = require("gulp-msbuild");

gulp.task("test", () => {
    return gulp.src(`./test/Tests.sln`)
        .pipe(msbuild({
            configuration: "Debug",
            stdout: true
        }));
});