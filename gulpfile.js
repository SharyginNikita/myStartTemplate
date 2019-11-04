const { src, dest, watch, series, parallel } = require('gulp');
const webpack = require('webpack-stream');
const Fiber = require('fibers');

const pug = require('gulp-pug');
const prettify = require('gulp-jsbeautifier');
const puglint = require('gulp-pug-lint');

const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const sassLint = require('gulp-sass-lint');

const named = require('vinyl-named');

const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gulpif = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync');

const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = require('./config.js');
const dir = config.dir;
let env = process.env.NODE_ENV.trim();

sass.compiler = require('sass');


function buildPug() {
    return src(`${dir.pug}pages/*.pug`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(pug())
        .pipe(prettify({}))
        .pipe(dest(`${dir.public}`))
};
exports.buildPug = buildPug;

function buildScss() {
    return src(`${dir.scss}*.scss`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(gulpif(env === 'development', sourcemaps.init()))
        .pipe(sass({fiber: Fiber}).on('error', sass.logError))
        .pipe(autoprefixer({
            grid: true
        }))
        .pipe(cleanCSS())
        .pipe(gulpif(env === 'development', sourcemaps.write()))
        .pipe(dest(`${dir.public}css`))
};
exports.buildScss = buildScss;

function buildJsDev() {
    return src(`${dir.js}`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(named())
        .pipe(webpack(require('./webpack.dev.js')))
        .pipe(dest(`${dir.public}js`))
};
exports.buildJsDev = buildJsDev;

function buildJsProd() {
    return src(`${dir.js}`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(named())
        .pipe(webpack(require('./webpack.prod.js')))
        .pipe(dest(`${dir.public}js`))
};
exports.buildJsProd = buildJsProd;

function buildImages() {
    return src(`${dir.images}**/*`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
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
        .pipe(dest(`${dir.public}images`))
}; 
exports.buildImages = buildImages;

function buildFonts() {
    return src(`${dir.fonts}`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(dest(`${dir.public}fonts`))
};
exports.buildFonts = buildFonts;

function testPug() {
    return src([`${dir.pug}**/*.pug`, `!${dir.pug}mixins/**`])
        .pipe(puglint())
}
exports.testPug = testPug;

function testScss() {
    return src(`${dir.scss}**/*`)
        .pipe(sassLint({}))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
}
exports.testScss = testScss;

function serve(cb) {
    browserSync.init({
        server: dir.public,
        port: 8080,
        host: "0.0.0.0"
    }, cb);
}
exports.serve = serve;

function reload(cb) {
    browserSync.reload();
    cb();
}

function clear() {
    return del([
        `${dir.public}*.html`,
        `${dir.public}css`,
        `${dir.public}js`,
        `${dir.public}images`,
    ]);
}
exports.clear = clear;

function watcher() {
    watch(`${dir.pug}**/*.pug`, series(buildPug, reload));
    watch(`${dir.scss}**/*.scss`, series(buildScss, reload));
    watch([`${dir.js}`, `${dir.vue}`], series(buildJsDev, reload));
    watch(`${dir.images}**/*`, series(buildImages, reload));
    watch(`${dir.fonts}`, series(buildFonts, reload));
}
exports.watcher = watcher;


exports.default = series(buildImages, buildPug, buildScss, buildJsDev, buildFonts, serve, watcher);
exports.gulpProd = series(buildImages, buildPug, buildScss, buildJsProd, buildFonts, serve, watcher);
exports.build = parallel(buildImages,  buildPug, buildScss, buildJsDev, buildFonts);
exports.test = series(testPug, testScss);




