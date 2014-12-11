'use strict';

// gulp
var gulp = require('gulp');
var cached = require('gulp-cached');
var merge = require('merge-stream');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var runSequence = require('run-sequence');
var del = require('del');

// css
var less = require('gulp-less');

// js
var watchify = require('watchify');
var browserify = require('browserify');
var reactify = require('reactify');
var sourcemaps = require('gulp-sourcemaps');

// dev
var http = require('http');
var path = require('path');
var ecstatic = require('ecstatic');
var liveReload = require('gulp-livereload');

// deploy
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var ghPages = require('gulp-gh-pages');

var libName = 'adventr-realtime'
var paths = {
  libSource: 'src/',
  tmp: 'tmptmp/',
  dist: 'dist/'
};
paths.static = [
  join(paths.demo, paths.libSource, '**/*'),
  join('!', paths.demo, paths.libSource, '**/*.less'),
  join('!', paths.demo, paths.libSource, '**/*.js'),
  'node_modules/odometer/odometer.js'
]
paths.distStatic = [
  join(paths.dist, '**/*'),
  join('!', paths.dist, '**/*.html'),
  join('!', paths.dist, '**/*.css'),
  join('!', paths.dist, '**/*.js')
]
paths.css = [
  join(paths.libSource, '**/*.less')
]
paths.js = [
  join(paths.libSource, '**/*.js')
]
var bundleCache = {};
var pkgCache = {};
function join (){
  return Array.prototype.slice.call(arguments).join('');
}

// tmp for development
// ============================================================================

gulp.task('tmp:clean', function (cb) {
  del(join(paths.tmp), cb);
});

gulp.task('tmp:css', function(){
  return gulp.src(join(paths.libSource, 'app.less'))
    .pipe(less())
    .pipe(gulp.dest(join(paths.tmp, 'css/')))
    .pipe(liveReload());
});

var appBundler = watchify(
  browserify(join('./', paths.libSource, 'app.js'), {
    cache: bundleCache,
    packageCache: pkgCache,
    fullPaths: true,
    standalone: 'app',
    debug: true
  })
);
appBundler.transform(reactify);
appBundler.exclude('showdown');

gulp.task('tmp:js', function(){
  return appBundler.bundle()
    // browserify -> gulp transfer
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(cached('app-js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(join(paths.tmp, 'js/')))
    .pipe(liveReload());
});

gulp.task('tmp:static', function(){
  return gulp.src(paths.static)
    .pipe(cached('static-tmp'))
    .pipe(gulp.dest(paths.tmp))
    .pipe(liveReload());
});

gulp.task("tmp", function(callback) {
  return runSequence(
    ['tmp:clean'],
    ['tmp:css', 'tmp:js', 'tmp:static'],
    callback
  );
});

gulp.task('server', function(cb){
  var port = parseInt(process.env.PORT) || 9090;
  var rootFolder = path.join(__dirname, paths.tmp);
  var server = http.createServer(ecstatic({root: rootFolder}));
  server.listen(port, cb);
});

gulp.task('watch', function(){
  gulp.watch(paths.css, ['tmp:css']);
  appBundler.on('update', function(){
    gulp.start('tmp:js');
  });
  gulp.watch(paths.static, ['tmp:static']);
});

gulp.task('default', function(callback) {
  return runSequence(
    ['tmp'],
    ['server', 'watch'],
    callback
  );
});

// dist
// ============================================================================

gulp.task('dist:clean', function (cb) {
  del(join(paths.dist), cb);
});

gulp.task('dist:usemin', function () {
  return gulp.src(join(paths.tmp, 'index.html'))
      .pipe(usemin({
        css: [rev()],
        html: [minifyHtml({empty: true})],
        js: [uglify(), rev()]
      }))
      .pipe(gulp.dest(paths.dist));
});

gulp.task('dist:static', function(){
  return gulp.src(paths.distStatic)
    .pipe(gulp.dest(paths.dist))
});

gulp.task("dist", function(callback) {
  return runSequence(
    ['dist:clean'],
    ['dist:usemin', 'dist:static'],
    callback
  );
});

// deploy
// ============================================================================

gulp.task('gh-pages', function(){
  return gulp.src(join(paths.dist, '**/*'))
    .pipe(ghPages());
});

gulp.task('deploy', function(callback) {
  return runSequence(
    ['dist'],
    ['gh-pages'],
    callback
  );
});
