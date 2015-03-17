var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var jscs   = require('gulp-jscs');
var mocha  = require('gulp-mocha');
var gutil = require('gulp-util');
require('./gulpfile-test.js');

var paths = {
  sources: ['index.js', 'lib/*.js'],
  tests: ['test/*.js']
};

function lintedChain(sources, watch) {
  var chain = gulp.src(sources)
    .pipe(jscs());

  if (watch) {
    chain = chain.on('error', function(error) {
      gutil.log(error.message);
      if (!watch) {
        chain.emit('error', error);
      }
    });
  }

  chain = chain
    .pipe(jshint())
    .pipe(jshint.reporter('default'));

  if (!watch) {
    chain = chain.pipe(jshint.reporter('fail'));
  }

  return chain;
}

function testTask(watch) {
  return function() {
    var chai = require('chai');
    var sinon = require('sinon');
    chai.use(require('sinon-chai'));

    global.expect = chai.expect;
    global.sinon = sinon;
    global.match = sinon.match;

    return lintedChain(paths.tests, watch)
      .pipe(mocha({
        slow:1000,
        reporter: watch ? 'dot' : 'spec',
        r:'./mocha-globals.js'
      }))
      .on('error', noop);
  };
}

gulp.task('test', testTask(false));
gulp.task('test-watchable', testTask(true));

gulp.task('lint-source', function() {
  return lintedChain(paths.sources, false);
});
gulp.task('lint-sources-watchable', function() {
  return lintedChain(paths.sources, true);
});

gulp.task('watch', function() {
  gulp.watch(paths.sources.concat(paths.tests),
    ['lint-sources-watchable', 'test-watchable']);
});

gulp.task('default', ['lint-source', 'test', 'gulp-test']);

function noop() {}
