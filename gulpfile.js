const { src, dest, watch, series, parallel } = require('gulp');
const webpack = require('webpack-stream');

const pug = require('gulp-pug');
const prettify = require('gulp-jsbeautifier');
const htmllint = require('gulp-htmllint');
const puglint = require('gulp-pug-lint');

const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const sassLint = require('gulp-sass-lint')

const named = require('vinyl-named');

const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const fancyLog = require('fancy-log');
const colors = require('ansi-colors');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync');

const VueLoaderPlugin = require('vue-loader/lib/plugin');

let env = process.env.NODE_ENV;

function htmllintReporter(filepath, issues) {
    if (issues.length > 0) {
        issues.forEach(issue => {
            fancyLog(colors.cyan('[gulp-htmllint] ') + colors.white(filepath + ' [' + issue.line + ',' + issue.column + ']: ') + colors.red('(' + issue.code + ') ' + issue.msg));
        });
 
        process.exitCode = 1;
    }
}

function lintCss(cb) {
    src('./src/scss/**/*.scss')
        .pipe(sassLint({}))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
    cb();
}

function buildHtml() {
    return src('./src/templates/pages/**/*.pug')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(gulpif(env === 'production', puglint()))
        .pipe(pug())
        .pipe(prettify({}))
        .pipe(gulpif(env === 'production', htmllint({}, htmllintReporter)))
        .pipe(dest('./public'))
};

function buildJs() {
    return src('./src/js/**/*.{js,json}')
        .pipe(named())
        .pipe(webpack(require('./webpack.config')))
        .pipe(dest('./public/js'))
};

function buildCss() {
    return src('./src/scss/main.scss')
        .pipe(gulpif(env === 'development', sourcemaps.init()))
        .pipe(sass({
            includePaths: ['./node_modules/hamburgers/_sass/hamburgers']
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            grid: true
        }))
        .pipe(cleanCSS())
        .pipe(gulpif(env === 'development', sourcemaps.write()))
        .pipe(dest('./public/css'))
};



function buildImages() {
    return src('./src/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imageminMozjpeg({quality: 90, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('./public/images'))
}; 


function buildFonts() {
    return src('./src/fonts/**/*')
        .pipe(dest('./public/fonts'))
};

function serve(cb) {
    browserSync.init({
        server: "./public",
        port: 8080,
        host: "0.0.0.0"
    }, cb);
}

function reload(cb) {
    browserSync.reload();
    cb();
}

function watcher() {
    watch('./src/templates/**/*.pug', series(buildHtml, reload));
    watch('./src/scss/**/*.scss', series(buildCss, reload));
    watch(['./src/public/js/**/*.js', './src/vuex/*', './src/widgets/*'], series(buildJs, reload));
    watch('./src/images/**/*', series(buildImages, reload));
    watch('./src/fonts/**/*', series(buildFonts, reload));
}

exports.buildHtml = buildHtml;
exports.buildCss = buildCss;
exports.buildJs = buildJs;
exports.lintCss = lintCss;
exports.serve = serve;

exports.default = parallel(buildHtml, buildCss, buildJs, buildImages, buildFonts, watcher, serve);
exports.build = parallel(buildHtml, buildCss, buildJs, buildImages, buildFonts);



