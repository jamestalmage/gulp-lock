var Promise = require('bluebird');

module.exports = function(depth) {
  depth = depth || 1;
  var queue = [];

  function next(cb) {
    var p = new Promise(cb);
    p.then(function() {
      if (queue.length) {
        next(queue.shift());
      } else {
        depth++;
      }
    });
  }

  return function(cb) {
    if (depth) {
      depth --;
      setTimeout(function() {
        next(cb);
      });
      return;
    }
    queue.push(cb);
  };
};
