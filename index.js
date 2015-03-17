module.exports = create;

function create() {
  var nextPromise = require('./lib/nextPromise')();
  return {
    cb: require('./lib/callback')(nextPromise),
    promise: require('./lib/promise')(nextPromise),
    stream: require('./lib/stream')(nextPromise)
  };
}
