var gulp = require('gulp');

var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var LibraryConfig = {
    SOURCE: [
        // Framework code
        './js/config/*.js',
        './js/utils/*.js',
        './js/base/*.js',
        './js/core/*.js',
        './js/App.js',

        // Built-ins
        './js/builtin/**/*.js'
    ],
    DEST_NAME: 'mvc-lite'
};

var AppConfig = {
    SOURCE: [
        './app/**/*.js',
    ],
    DEST_NAME: 'app'
};

var DEST_PATH = "./dist/";

gulp.task('compile-mvc', function() {
    return gulp.src(LibraryConfig.SOURCE)
        .pipe(concat(LibraryConfig.DEST_NAME + '.js'))
        .pipe(gulp.dest(DEST_PATH))
        .pipe(rename(LibraryConfig.DEST_NAME + '.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(DEST_PATH));
});

gulp.task('compile-app', function() {
    return gulp.src(AppConfig.SOURCE)
        .pipe(concat(AppConfig.DEST_NAME + '.js'))
        .pipe(gulp.dest(DEST_PATH))
        .pipe(rename(AppConfig.DEST_NAME + '.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(DEST_PATH));
});

gulp.task('watch', function() {
    gulp.watch('js/**/*.js', ['compile-mvc']);
    gulp.watch('app/**/*.js', ['compile-app']);
});