module.exports = create;
var lib = require('./lib');

function create() {
  var nextPromise = lib.nextPromise();
  return {
    cb: lib.cb(nextPromise),
    promise: lib.promise(nextPromise),
    stream: lib.stream(nextPromise)
  };
}
