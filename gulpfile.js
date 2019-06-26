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
const browserSync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

gulp.task('build-html', done => {
    gulp.src('./src/templates/**/*.pug')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(pug())
        .pipe(prettify({}))
        .pipe(gulp.dest('./public'))
        .pipe(browserSync.reload({stream: true}))
    done();
});


gulp.task('build-js', done => {
    gulp.src('./src/js/**/*.{js,json}')
        .pipe(named())
        .pipe(webpack(require('./webpack.config')))
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.reload({stream: true}))
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
        .pipe(browserSync.reload({stream: true}))
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
        .pipe(browserSync.reload({stream: true}))
    done();
}); 


gulp.task('build-fonts', done => {
    gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./public/fonts'))
        .pipe(browserSync.reload({stream: true}))
    done();
});


gulp.task('serve', () => {

    browserSync.init({
        server: {
            baseDir: './public'
        },
    });

    gulp.watch('./src/templates/**/*.pug', gulp.parallel('build-html'));    
    gulp.watch('./src/js/**/*.js', gulp.parallel('build-js'));    
    gulp.watch('./src/vuex/*', gulp.parallel('build-js'));    
    gulp.watch('./src/widgets/*', gulp.parallel('build-js'));    
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('build-css'));    
    gulp.watch('./src/images/**/*', gulp.parallel('build-images'));

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


