var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));

global.expect = chai.expect;
global.sinon = sinon;
global.match = sinon.match;
