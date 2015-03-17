describe('exclusive-task', function() {

  var exclusive = require('..');
  var Promise = require('bluebird');
  var stream = require('stream');
  var Readable = stream.Readable;
  var Writable = stream.Writable;
  var util = require('util');

  var excl;

  beforeEach(function() {
    excl = exclusive();
  });

  it('handles callbacks', function(done) {
    var spy1 = sinon.spy(function(cb) {});
    var spy2 = sinon.spy(function(cb) {});

    var cb1 = sinon.spy();
    var cb2 = sinon.spy();

    var wrapped1 = excl.cb(spy1);
    var wrapped2 = excl.cb(spy2);

    wrapped1(cb1);
    wrapped2(cb2);

    setTimeout(function() {
      expect(spy1.called).to.equal(true);
      expect(cb1.called).to.equal(false);
      expect(spy2.called).to.equal(false);
      expect(cb2.called).to.equal(false);

      spy1.args[0][0](null, 'result');
      expect(cb1.called).to.equal(true);
      expect(spy2.called).to.equal(false);
      expect(cb2.called).to.equal(false);
    }, 50);

    setTimeout(function() {
      expect(spy2.called).to.equal(true);
      expect(cb2.called).to.equal(false);

      spy2.args[0][0](null, 'result');
      expect(cb2.called).to.equal(true);
      done();
    }, 100);
  });

  it('handles tasks that return promises', function(done) {
    var deferreds = [];

    function returnPromise() {
      return new Promise(function(resolve, reject) {
        deferreds.push({
          resolve:resolve,
          reject:reject
        });
      });
    }

    var spy1 = sinon.spy(returnPromise);
    var spy2 = sinon.spy(returnPromise);

    var wrapped1 = excl.promise(spy1);
    var wrapped2 = excl.promise(spy2);

    wrapped1();
    wrapped2();

    setTimeout(function() {
      expect(spy1.called).to.equal(true);
      expect(spy2.called).to.equal(false);

      deferreds[0].resolve('foo');
    }, 50);

    setTimeout(function() {
      expect(spy1.called).to.equal(true);
      expect(spy2.called).to.equal(true);
      done();
    }, 100);
  });

  it('handles tasks that return streams', function(done) {
    //var inputs = [];
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

  util.inherits(PrefixCount, Readable);

  function PrefixCount(prefix) {
    Readable.call(this, {objectMode:true});
    this._index = 0;
    this._prefix = prefix;
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
    }, 10);
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
