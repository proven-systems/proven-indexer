var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Indexer = require('../src/indexer');

describe('Indexer', function() {

    var sandbox;
    var options;
    var indexer;

    beforeEach(function() {
        options = {
            proven: {
                onDepositionPublished: sinon.spy()
            }
        };
        indexer = new Indexer(options);
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('can be run once', function() {
        indexer.runOnce();
        expect(options.proven.onDepositionPublished).to.have.been.called;
    });
});
