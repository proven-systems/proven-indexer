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
    var mockDeposition = {ipfsHash: 'abcd'};
    var mockMetadata = {filename: 'abcd', importantTag: 'efg'};

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        options = {
            proven: {onDepositionPublished: (callback) => {callback(mockDeposition);}},
            retriever: {getMetadataFor: (ipfsHash) => {return mockMetadata;}},
            repository: {store: (metadata) => {}}
        };
        indexer = new Indexer(options);
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('hooks the onDepositionPublished event on the contract', function() {
        sinon.spy(options.proven, 'onDepositionPublished');
        indexer.runOnce();
        expect(options.proven.onDepositionPublished).to.have.been.called;
    });

    it('asks the image retriever for the metadata', function() {
        sinon.spy(options.retriever, 'getMetadataFor');
        indexer.runOnce();
        expect(options.retriever.getMetadataFor).to.have.been.calledWith(mockDeposition.ipfsHash);
    });

    it('stores the metadata into the repository', function() {
        sinon.spy(options.repository, 'store');
        indexer.runOnce();
        expect(options.repository.store).to.have.been.calledWith(mockMetadata);
    });
});
