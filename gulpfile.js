var gulp = require('gulp');

var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var SOURCE = [
    // Framework code
    './js/config/*.js',
    './js/utils/*.js',
    './js/base/*.js',
    './js/core/*.js',
    './js/App.js',

    // Built-ins
    './js/builtin/**/*.js'
];
var DEST_NAME = "mvc-lite";
var DEST_PATH = "./dist/";

gulp.task('compile', function() {
    return gulp.src(SOURCE)
        .pipe(concat(DEST_NAME + '.js'))
        .pipe(gulp.dest(DEST_PATH))
        .pipe(rename(DEST_NAME + '.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(DEST_PATH));
});

gulp.task('watch', function() {
    gulp.watch('js/**/*.js', ['compile']);
});