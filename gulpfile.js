const { src, dest, watch, series, parallel } = require("gulp");
const webpack = require("webpack-stream");
const Fiber = require("fibers");

const pug = require("gulp-pug");
const prettify = require("gulp-jsbeautifier");
const pugLinter = require("gulp-pug-linter");

const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const cleanCSS = require("gulp-clean-css");
const autoprefixer = require("gulp-autoprefixer");
//const sassLint = require("gulp-sass-lint");

const named = require("vinyl-named");

const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");

const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const gulpif = require("gulp-if");
const del = require("del");
const browserSync = require("browser-sync");

const VueLoaderPlugin = require("vue-loader/lib/plugin");

const config = require("./config.js");
const dir = config.dir;
const modeProdIndex = process.argv.indexOf("--prod");

let mode = config.mode.dev;

//console.log(process.argv);

if (modeProdIndex > -1) {
    mode = 'production';
}

console.log(mode);

sass.compiler = require("sass");

function buildPug() {
    return src(`${dir.pug}pages/*.pug`)
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
        )
        .pipe(pug())
        .pipe(prettify({}))
        .pipe(dest(`${dir.public}`));
}
exports.buildPug = buildPug;

function buildScss() {
    return src(`${dir.scss}*.scss`)
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
        )
        .pipe(gulpif(mode === "development", sourcemaps.init()))
        .pipe(sass({ fiber: Fiber }).on("error", sass.logError))
        .pipe(
            autoprefixer({
                grid: true
            })
        )
        .pipe(cleanCSS())
        .pipe(gulpif(mode === "development", sourcemaps.write()))
        .pipe(dest(`${dir.public}css`));
}
exports.buildScss = buildScss;

function buildJsDev() {
    return src(`${dir.js}`)
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
        )
        .pipe(named())
        .pipe(webpack(require("./webpack.dev.js")))
        .pipe(dest(`${dir.public}js`));
}
exports.buildJsDev = buildJsDev;

function buildJsProd() {
    return src(`${dir.js}`)
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
        )
        .pipe(named())
        .pipe(webpack(require("./webpack.prod.js")))
        .pipe(dest(`${dir.public}js`));
}
exports.buildJsProd = buildJsProd;

function buildImages() {
    return src(`${dir.images}**/*`)
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
        )
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imageminMozjpeg({ quality: 90, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
                })
            ])
        )
        .pipe(dest(`${dir.public}images`));
}
exports.buildImages = buildImages;

function buildFavicon() {
    return src(`${dir.images}favicon.ico`)
        .pipe(dest(`${dir.public}`));
}

function buildFonts() {
    return src(`${dir.fonts}`)
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
        )
        .pipe(dest(`${dir.public}fonts`));
}
exports.buildFonts = buildFonts;

function testPug() {
    return src([`${dir.pug}**/*.pug`, `!${dir.pug}mixins/**`]).pipe(pugLinter({ reporter: 'default' }))
}
exports.testPug = testPug;

// function testScss() {
//     return src(`${dir.scss}**/*`)
//         .pipe(sassLint({}))
//         .pipe(sassLint.format())
//         .pipe(sassLint.failOnError());
// }
// exports.testScss = testScss;


//exports.test = series(testPug, testScss);
//gulp-sass lint doesn't support dart-sass

function serve(cb) {
    browserSync.init(
        {
            server: dir.public,
            port: 8080,
            host: "0.0.0.0"
        },
        cb
    );
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
        `${dir.public}favicon.ico`
    ]);
}
exports.clear = clear;

function watcher() {
    watch(
        `${dir.pug}**/*.pug`,
        series(buildPug, reload)
    );
    watch(
        `${dir.scss}**/*.scss`,
        series(buildScss, reload)
    );
    if (mode === 'development') {
        watch(
            [`${dir.js}`, `${dir.vue}`],
            series(buildJsDev, reload)
        );
    } else {
        watch(
            [`${dir.js}`, `${dir.vue}`],
            series(buildJsProd, reload)
        );
    }
    watch(
        `${dir.images}**/*`,
        series(buildImages, buildFavicon, reload)
    );
    watch(
        `${dir.fonts}`,
        series(buildFonts, reload)
    );
}
exports.watcher = watcher;

exports.buildDev = series(
    buildImages,
    buildFavicon,
    buildPug,
    buildScss,
    buildJsDev,
    buildFonts,
);

exports.buildProd = series(
    buildImages,
    buildFavicon,
    buildPug,
    buildScss,
    buildJsProd,
    buildFonts,
);

let defaultTask = mode === 'development' ? this.buildDev : this.buildProd;

exports.default = series(defaultTask, serve, watcher);