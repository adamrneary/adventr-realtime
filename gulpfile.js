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

// dev/deploy
var http = require('http');
var path = require('path');
var ecstatic = require('ecstatic');
var liveReload = require('gulp-livereload');
var ghPages = require('gulp-gh-pages');

var libName = 'adventr-realtime'
var paths = {
  libSource: 'src/',
  tmp: 'tmp',
  dist: 'dist/'
};
paths.static = [
  join(paths.demo, paths.libSource, '**/*'),
  join('!', paths.demo, paths.libSource, '**/*.less'),
  join('!', paths.demo, paths.libSource, '**/*.js')
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
appBundler.exclude('jquery');

gulp.task('js', function(){
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
  demoBundler.on('update', function(){
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

// TODO: Minify and copy over
gulp.task('dist:css', function(){
  // gulp.src(join(paths.tmp, 'app.css'))
  //   .pipe(cached('dist-css'))
  //   // .pipe(less())
  //   // .pipe(rename(join(libName, '.css')))
  //   .pipe(gulp.dest(paths.dist))
});

// TODO: Minify and copy over
gulp.task('dist:js', function(){
  // gulp.src(join(paths.tmp, 'app.js'))
  //   .pipe(cached('dist-css'))
  //   // .pipe(less())
  //   // .pipe(rename(join(libName, '.css')))
  //   .pipe(gulp.dest(paths.dist))
});

// TODO: Minify and copy over
gulp.task('dist:static', function(){
  // gulp.src(join(paths.tmp, 'app.js'))
  //   .pipe(cached('dist-css'))
  //   // .pipe(less())
  //   // .pipe(rename(join(libName, '.css')))
  //   .pipe(gulp.dest(paths.dist))
});

gulp.task("dist", function(callback) {
  return runSequence(
    ['dist:clean'],
    ['dist:css', 'dist:js', 'dist:static'],
    callback
  );
});

// deploy
// ============================================================================

gulp.task('gh-pages', function(){
  return gulp.src(join(paths.demo, paths.dist, '**/*'))
    .pipe(ghPages());
});

gulp.task('deploy', function(callback) {
  return runSequence(
    ['dist'],
    ['gh-pages'],
    callback
  );
});
