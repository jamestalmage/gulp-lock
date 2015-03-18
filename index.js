module.exports = create;
var lib = require('./lib');

function create(depth) {
  var nextPromise = lib.nextPromise(depth);
  return {
    cb: lib.cb(nextPromise),
    promise: lib.promise(nextPromise),
    stream: lib.stream(nextPromise)
  };
}
