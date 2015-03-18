module.exports = create;
var lib = require('./lib');

function create(depth) {
  var nextPromise = lib.nextPromise(depth);
  return {
    cb: lib.cb(nextPromise),
    promise: lib.promise(nextPromise),
    stream: lib.stream(nextPromise),
    unlimited: unlimited
  };
}

function unlimited(depth) {
  return unlimited;
}

create.unlimited = unlimited.unlimited = unlimited;

['cb', 'promise', 'stream'].forEach(function(prop) {
  unlimited[prop] = identity;
});

function identity(obj) {return obj;}
