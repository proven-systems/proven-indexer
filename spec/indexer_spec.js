var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Indexer = require('../src/indexer');

describe('Indexer', function() {

    var sandbox;
    var proven;
    var retriever;
    var repository;
    var indexer;
    var mockDeposition = {ipfsHash: 'abcd'};
    var mockMetadata = {filename: 'abcd', importantTag: 'efg'};

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        proven = {
            onDepositionPublished: (callback) => {callback(mockDeposition);}
        };
        retriever = {
            getMetadataFor: (ipfsHash) => {return mockMetadata;}
        };
        repository = {
            store: (metadata) => {}
        };
        indexer = new Indexer(proven, retriever, repository);
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('hooks the onDepositionPublished event on the contract', function() {
        sinon.spy(proven, 'onDepositionPublished');
        indexer.runOnce();
        expect(proven.onDepositionPublished).to.have.been.called;
    });

    it('asks the image retriever for the metadata', function() {
        sinon.spy(retriever, 'getMetadataFor');
        indexer.runOnce();
        expect(retriever.getMetadataFor).to.have.been.calledWith(mockDeposition.ipfsHash);
    });

    it('stores the metadata into the repository', function() {
        sinon.spy(repository, 'store');
        indexer.runOnce();
        expect(repository.store).to.have.been.calledWith(mockMetadata);
    });
});
