module.exports = function(nextPromise) {
  return function wrapCallbackTask(func) {
    if (!func.length) {
      console.warn(func, 'should take a callback');
    }

    return function(cb) {
      var args = Array.prototype.slice.call(arguments);
      var self = this;
      nextPromise(function(resolve, reject) {
        args[0] = function(err) {
          if (err) {
            reject(err);
          }
          resolve(true);
          cb.apply(this, arguments);
        };

        func.apply(self, args);
      });
    };
  };
};
