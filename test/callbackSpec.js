describe('handles callbacks', function() {
  var exclusive = require('..');

  it('depth = 1', function(done) {
    var excl = exclusive();
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

  it('depth = 2', function(done) {
    var excl = exclusive(2);
    var spy1 = sinon.spy(function(cb) {});
    var spy2 = sinon.spy(function(cb) {});
    var spy3 = sinon.spy(function(cb) {});

    var cb1 = sinon.spy();
    var cb2 = sinon.spy();
    var cb3 = sinon.spy();

    var wrapped1 = excl.cb(spy1);
    var wrapped2 = excl.cb(spy2);
    var wrapped3 = excl.cb(spy3);

    wrapped1(cb1);
    wrapped2(cb2);
    wrapped3(cb3);

    setTimeout(function() {
      expect(spy1.called).to.equal(true);
      expect(cb1.called).to.equal(false);
      expect(spy2.called).to.equal(true);
      expect(cb2.called).to.equal(false);
      expect(spy3.called).to.equal(false);
      expect(cb3.called).to.equal(false);

      spy1.args[0][0](null, 'result');
      expect(cb1.called).to.equal(true);
      expect(cb2.called).to.equal(false);
      expect(spy3.called).to.equal(false);
      expect(cb3.called).to.equal(false);
    }, 50);

    setTimeout(function() {
      expect(spy3.called).to.equal(true);
      expect(cb2.called).to.equal(false);
      expect(cb3.called).to.equal(false);

      spy2.args[0][0](null, 'result');
      expect(cb2.called).to.equal(true);
      spy3.args[0][0](null, 'result');
      expect(cb3.called).to.equal(true);
      done();
    }, 100);
  });
});
