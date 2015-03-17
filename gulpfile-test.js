var gulp = require('gulp');
var transform = require('vinyl-transform');
var cat = require('gulp-cat');
var Promise = require('bluebird');
var assert = require('assert');

var log = [];
var lock = require('./')();

gulp.task('stream:start', lock.stream(function() {
  log.push('stream:start');
  return gulp.src('/usr/share/dict/words', {buffer:false})
    .pipe(transform(dots))
    .pipe(cat());
}));

gulp.task('stream:end', ['stream:start'], function() {
  log.push('stream:end');
});

gulp.task('stream2:start', lock.stream(function() {
  log.push('stream2:start');
  return gulp.src('/usr/share/dict/words', {buffer:false})
    .pipe(transform(dots))
    .pipe(cat());
}));

gulp.task('stream2:end', ['stream2:start'], function() {
  log.push('stream2:end');
});

gulp.task('stream', ['stream:end', 'stream2:end']);

gulp.task('cb:start', lock.cb(function(cb) {
  log.push('cb:start');
  setTimeout(cb, 200);
}));

gulp.task('cb:end', ['cb:start'], function() {
  log.push('cb:end');
});

gulp.task('cb2:start', lock.cb(function(cb) {
  log.push('cb2:start');
  setTimeout(cb, 200);
}));

gulp.task('cb2:end', ['cb2:start'], function() {
  log.push('cb2:end');
});

gulp.task('cb', ['cb:end', 'cb2:end']);

gulp.task('promise:start', lock.promise(function() {
  log.push('promise:start');
  return new Promise(function(resolve) {
    setTimeout(resolve, 200);
  });
}));

gulp.task('promise:end', ['promise:start'], function() {
  log.push('promise:end');
});

gulp.task('promise2:start', lock.promise(function() {
  log.push('promise2:start');
  return new Promise(function(resolve) {
    setTimeout(resolve, 200);
  });
}));

gulp.task('promise2:end', ['promise2:start'], function() {
  log.push('promise2:end');
});

gulp.task('promise', ['promise:end', 'promise2:end']);

gulp.task('gulp-test', ['stream', 'cb', 'promise'], function() {
  var expected = [
    'stream:start',
    'stream:end',
    'stream2:start',
    'stream2:end',
    'cb:start',
    'cb:end',
    'cb2:start',
    'cb2:end',
    'promise:start',
    'promise:end',
    'promise2:start',
    'promise2:end'
  ];
  assert.deepEqual(log, expected)
});

var Transform = require('stream').Transform;

function dots() {
  var d = new Transform();
  d._transform = function(chunk, enc, cb) {
    cb(null, '.');
  };
  return d;
}
