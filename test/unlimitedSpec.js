describe('unlimited', function() {
  var lock = require('../');

  function testIdentity(id) {
    it(id, function() {
      var expected = {};
      expect(lock.unlimited[id](expected)).to.equal(expected);
    });
  }

  testIdentity('cb');
  testIdentity('promise');
  testIdentity('stream');
});
