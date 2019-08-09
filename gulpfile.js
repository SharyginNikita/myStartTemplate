const { src, dest, watch, series, parallel } = require('gulp');
const webpack = require('webpack-stream');

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

const changed = require('gulp-changed');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gulpif = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync');

const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = require('./config.js');
const dir = config.dir;
let env = process.env.NODE_ENV;


function buildPug() {
    return src(`${dir.pug}pages/*.pug`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(changed(`${dir.pug}pages/*.pug`))
        .pipe(pug())
        .pipe(prettify({}))
        .pipe(dest('./public'))
};
exports.buildPug = buildPug;

function buildScss() {
    return src(`${dir.scss}*.scss`)
    //.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(changed(`${dir.scss}*.scss`))
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
exports.buildScss = buildScss;

function buildJs() {
    return src(`${dir.js}`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(changed(`${dir.js}`))
        .pipe(named())
        .pipe(webpack(require('./webpack.config')))
        .pipe(dest('./public/js'))
};
exports.buildJs = buildJs;

function buildImages() {
    return src(`${dir.images}`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(changed(`${dir.images}`))
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
    return src(`${dir.fonts}`)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(changed(`${dir.fonts}`))
        .pipe(dest('./public/fonts'))
};

function testPug() {
    return src([`${dir.pug}**/*.pug`, `!${dir.pug}mixins/**`])
        .pipe(puglint())
}
exports.testPug = testPug;

function testScss() {
    return src(`${dir.scss}**/*.scss`)
        .pipe(sassLint({}))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
}
exports.testScss = testScss;

function serve(cb) {
    browserSync.init({
        server: "./public",
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
        './public/**/*',
      '!./public/data',
  ]);
}
exports.clear = clear;

function watcher() {
    watch(`${dir.pug}**/*.pug`, series(buildPug, reload));
    watch(`${dir.scss}**/*.scss`, series(buildScss, reload));
    watch([`${dir.js}`, `${dir.vue}`], series(buildJs, reload));
    watch(`${dir.images}`, series(buildImages, reload));
    watch(`${dir.fonts}`, series(buildFonts, reload));
}
exports.watcher = watcher;


exports.default = parallel(buildPug, buildScss, buildJs, buildImages, buildFonts, watcher, serve);
exports.build = parallel(buildPug, buildScss, buildJs, buildImages, buildFonts);
exports.test = series(testPug, testScss);



