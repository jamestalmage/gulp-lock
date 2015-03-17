var assert = require('assert');
var Promise = require('bluebird');

module.exports = function(nextPromise) {
  return function wrapPromiseReturningTask(func) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      var self = this;
      var resolve2;
      var reject2;
      nextPromise(function(resolve, reject) {
        var r = func.apply(self, args);
        assert(isPromise(r), 'expected a promise returning task');
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
      });

      return new Promise(function(resolve, reject) {
        resolve2 = resolve;
        reject2 = reject;
      });
    };
  };
};

function isPromise(p) {
  return p && typeof p.then === 'function';
}
