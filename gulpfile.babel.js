import browserify from "browserify";
import gulp from "gulp";
import eslint from "gulp-eslint";
import uglify from "gulp-uglify";
import rename from "gulp-rename";
import header from "gulp-header";
import runSequence from "run-sequence";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

import pkg from "./package.json";


gulp.task("dist", callback => {
  return runSequence.use(gulp)(
      "compile",
      "uglify",
      "header",
      callback
      );
});

gulp.task("compile", () => {
  return browserify({
    entries: "anzu.js",
    debug: false,
    standalone: "Anzu"
  })
  .transform("babelify")
  .bundle()
  .pipe(source("anzu.js"))
  .pipe(buffer())
  .pipe(gulp.dest("dist"));
});

gulp.task("uglify", () => {
  return gulp.src(["dist/anzu.js"])
    .pipe(uglify())
    .pipe(rename({extname: ".min.js"}))
    .pipe(gulp.dest("dist"));
});

gulp.task("header", () => {
  let banner = `/**
 * <%= pkg.name %>
 * <%= pkg.description %>
 * @version <%= pkg.version %>
 * @author <%= pkg.author %>
 * @license <%= pkg.license %>
 */
`;
  return gulp.src(["dist/anzu.js", "dist/anzu.min.js"])
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest("dist"));
});

gulp.task("eslint", () => {
  return gulp.src(["anzu.js"])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});
