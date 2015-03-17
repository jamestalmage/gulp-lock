module.exports = create;

var Promise = require('bluebird');
var assert = require('assert');
var eos = require('end-of-stream');
var through = require('through');

function create() {
  var currentPromise = Promise.resolve(true);
  return {
    cb: wrapCallbackTask,
    promise: wrapPromiseReturningTask,
    stream: wrapStreamReturningTask
  };

  function wrapCallbackTask(func) {
    if (!func.length) {
      console.warn(func, 'should take a callback');
    }

    return function(cb) {
      var oldPromise = currentPromise;
      var args = Array.prototype.slice.call(arguments);
      var self = this;
      currentPromise = new Promise(function(resolve, reject) {
        args[0] = function(err) {
          if (err) {
            reject(err);
          }
          resolve(true);
          cb.apply(this, arguments);
        };

        oldPromise.then(
          function() {
            func.apply(self, args);
          },
          function(err) {
            // TODO: How to handle errors?
          }
        );
      });
    };
  }

  function wrapPromiseReturningTask(func) {
    return function() {
      var oldPromise = currentPromise;
      var args = Array.prototype.slice.call(arguments);
      var self = this;
      var resolve2;
      var reject2;
      currentPromise = new Promise(function(resolve, reject) {
        oldPromise.then(
          function() {
            var r = func.apply(self, args);
            assert(r && typeof r.then === 'function',
              'expected a promise returning task');
            r.then(
              function(result) {
                resolve2(result);
                resolve(true);
              },
              function(err) {
                reject2(err);
                reject(err);
              }
            );
          },
          function(err) {
            // TODO: How to handle errors?
          }
        );
      });

      return new Promise(function(resolve, reject) {
        resolve2 = resolve;
        reject2 = reject;
      });
    };
  }

  function wrapStreamReturningTask(func) {
    return function() {
      var oldPromise = currentPromise;
      var args = Array.prototype.slice.call(arguments);
      var self = this;
      var ps = through();
      currentPromise = new Promise(function(resolve, reject) {
        oldPromise.then(
          function(result) {
            var r = func.apply(self, args);
            assert(r && typeof r.pipe === 'function',
              'expected a stream returning task');

            eos(
              r,
              {error: true, readable: r.readable,
                writable: r.writable && !r.readable},
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(true);
                }
              }
            );

            r.pipe(ps);
          },
          function(err) {
            //TODO: How to handle errors
          }
        );
      });
      return ps;
    };
  }
}
