describe('handles tasks that return streams', function() {
  var exclusive = require('..');
  var stream = require('stream');
  var Readable = stream.Readable;
  var Writable = stream.Writable;
  var util = require('util');

  it('depth = 1', function(done) {
    var excl = exclusive();
    var log = [];
    function prefixCountTask(prefix) {
      return function() {
        var prefixStream = new PrefixCount(prefix);
        prefixStream.pipe(new LogStream(log));
        return prefixStream;
      };
    }
    var spy1 = sinon.spy(prefixCountTask('a'));
    var spy2 = sinon.spy(prefixCountTask('b'));

    var wrapped1 = excl.stream(spy1);
    var wrapped2 = excl.stream(spy2);

    wrapped1();
    wrapped2();

    setTimeout(function() {
      expect(spy1.called).to.equal(true);
      expect(spy2.called).to.equal(false);
    }, 10);

    setTimeout(function() {
      var expected = [
        'a:0', 'a:1', 'a:2', 'a:3', 'a:4', 'a:5',
        'b:0', 'b:1', 'b:2', 'b:3', 'b:4', 'b:5'
      ];
      expect(log).to.eql(expected);
      done();
    }, 200);
  });

  it('depth = 2', function(done) {
    var excl = exclusive(2);
    var log = [];
    function prefixCountTask(prefix, delay) {
      return function() {
        var prefixStream = new PrefixCount(prefix, delay);
        prefixStream.pipe(new LogStream(log));
        return prefixStream;
      };
    }
    var spy1 = sinon.spy(prefixCountTask('a', 20));
    var spy2 = sinon.spy(prefixCountTask('b', 30));
    var spy3 = sinon.spy(prefixCountTask('c'));

    var wrapped1 = excl.stream(spy1);
    var wrapped2 = excl.stream(spy2);
    var wrapped3 = excl.stream(spy3);

    wrapped1();
    wrapped2();
    wrapped3();

    setTimeout(function() {
      expect(spy1.called).to.equal(true);
      expect(spy2.called).to.equal(true);
      expect(spy3.called).to.equal(false);
    }, 10);

    setTimeout(function() {
      expect(indexOf('a:5')).to.be.lt(indexOf('c:1'));  // c starts after a ends
      expect(indexOf('b:5')).to.be.gt(indexOf('c:1'));  // but before b ends
      done();
    }, 400);

    function indexOf(str) {
      var i = log.indexOf(str);
      expect(i).to.be.gte(0);
      return i;
    }
  });

  util.inherits(PrefixCount, Readable);

  function PrefixCount(prefix, delay) {
    Readable.call(this, {objectMode:true});
    this._index = 0;
    this._prefix = prefix;
    this._delay = delay || 10;
  }

  PrefixCount.prototype._read = function() {
    var self = this;
    setTimeout(function() {
      var i = self._index ++;
      if (i > 5) {
        self.push(null);
      } else {
        self.push(self._prefix + ':' + i);
      }
    }, this._delay);
  };

  util.inherits(LogStream, Writable);

  function LogStream(log) {
    Writable.call(this, {objectMode:true, decodeStrings:false});
    this._log = log;
  }

  LogStream.prototype._write = function(chunk, encoding, callback) {
    this._log.push(chunk);
    callback();
  };
});
