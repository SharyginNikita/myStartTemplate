const gulp = require('gulp');
const webpack = require('webpack-stream');
const pug = require('gulp-pug');
const prettify = require('gulp-jsbeautifier');
const named = require('vinyl-named');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const browsersync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

gulp.task('build-html', () => {
    gulp.src('./src/templates/**/*.pug')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(pug())
        .pipe(prettify({}))
        .pipe(gulp.dest('./public'))
        .pipe(browsersync.stream());
});


gulp.task('build-js', done => {
    gulp.src('./src/js/**/*.{js,json}')
        .pipe(named())
        .pipe(webpack(require('./webpack.config')))
        .pipe(gulp.dest('./public/js'))
    done();
});

gulp.task('build-css', done => {
    gulp.src('./src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['./node_modules/hamburgers/_sass/hamburgers']
        }).on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/css'))
    done();
});

gulp.task('build-images', done => {
    gulp.src('./src/images/**/*')
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
        .pipe(gulp.dest('./public/images'))
    done();
}); 


gulp.task('build-fonts', done => {
    gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./public/fonts'))
    done();
});

// gulp.task('browser-sync', done => {
//     browserSync.init({
//         server: {
//             baseDir: "./public"
//         }
//     });
//     done();
// });

// gulp.task('watch', gulp.parallel('browser-sync', function (done) {
//     gulp.watch('./src/templates/**/*.pug', gulp.series('build-html'));
//     done();
// }));
//


gulp.task("serve", () => {
    browsersync.init({
        server: "./public/",
        port: 4000,
        notify: true
    });

    gulp.watch('./src/templates/**/*.pug', gulp.parallel("build-html"));
});
gulp.task('default', 
    gulp.parallel(
        'build-fonts',
        'build-html',
        'build-js',
        'build-css',
        'build-images',
        'serve'
    )
);



