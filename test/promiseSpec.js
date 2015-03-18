describe('handles tasks that return promises', function() {
  var exclusive = require('..');
  var Promise = require('bluebird');

  it('depth = 1', function(done) {
    var excl = exclusive();

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

  it('depth = 2', function(done) {
    var excl = exclusive(2);

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
    var spy3 = sinon.spy(returnPromise);

    var wrapped1 = excl.promise(spy1);
    var wrapped2 = excl.promise(spy2);
    var wrapped3 = excl.promise(spy3);

    wrapped1();
    wrapped2();
    wrapped3();

    setTimeout(function() {
      expect(spy1.called).to.equal(true);
      expect(spy2.called).to.equal(true);
      expect(spy3.called).to.equal(false);

      deferreds[0].resolve('foo');
    }, 50);

    setTimeout(function() {
      expect(spy1.called).to.equal(true);
      expect(spy2.called).to.equal(true);
      expect(spy3.called).to.equal(true);
      done();
    }, 100);
  });
});
