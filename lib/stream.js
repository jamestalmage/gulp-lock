var assert = require('assert');
var eos = require('end-of-stream');
var through = require('through');

module.exports = function(nextPromise) {
  return function wrapStreamReturningTask(func) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      var self = this;
      var ps = through();
      nextPromise(function(resolve, reject) {
        var r = func.apply(self, args);

        assert(isReadableStream(r), 'expected a stream returning task');

        eos(r, eosOptions(r), function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });

        r.pipe(ps);
      });
      return ps;
    };
  };
};

function isReadableStream(s) {
  return s && typeof s.pipe === 'function';
}

function eosOptions(stream) {
  return {
    error: true,
    readable: stream.readable,
    writable: stream.writable && !stream.readable
  };
}
