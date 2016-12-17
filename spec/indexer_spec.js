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
        sandbox = sinon.sandbox.create();
        options = {
            proven: {onDepositionPublished: sinon.spy()},
            retriever: {getMetadataFor: sinon.spy()}
        };
        indexer = new Indexer(options);
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('hooks the onDepositionPublished event on the contract', function() {
        indexer.runOnce();
        expect(options.proven.onDepositionPublished).to.have.been.called;
    });

    it('asks the image retriever for the metadata', function() {
        var deposition = {ipfsHash: 'abcd'};
        options.proven.onDepositionPublished = function(callback) {
            callback(deposition)
        };
        indexer.runOnce();
        expect(options.retriever.getMetadataFor).to.have.been.calledWith(deposition.ipfsHash);
    });
});
