var Promise = require('bluebird');

module.exports = function() {
  var currentPromise = Promise.resolve('initial');

  return function(cb) {
    var oldPromise = currentPromise;
    currentPromise = new Promise(function(resolve, reject) {
      oldPromise.then(
        function(result) {
          cb(resolve, reject);
        },
        function(reason) {
          console.warn(reason);
          // TODO: Handle Errors
        }
      );
    });
  };
};
