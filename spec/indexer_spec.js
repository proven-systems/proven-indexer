var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Indexer = require('../src/indexer');

describe('Indexer', function() {

    var sandbox;
    var proven;
    var ipfsLink;
    var metadataGatherer;
    var repository;
    var indexer;
    var mockDeposition = {ipfsHash: 'abcd'};
    var mockManifest = {payloadFilePath: '/path/to/file'};
    var mockPayload = {};
    var mockMetadata = {filename: 'abcd', importantTag: 'efg'};

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        proven = {
            onDepositionPublished: (callback) => {callback(mockDeposition);}
        };
        ipfsLink = {
            pinEnclosure: (ipfsHash, callback) => {callback();},
            readManifest: (ipfsHash, callback) => {callback(mockManifest);},
            readPayload: (ipfsHash, filename, callback) => {callback(mockPayload);}
        };
        metadataGatherer = {
            gatherFor: (manifest, payload, callback) => {callback(mockMetadata);}
        };
        repository = {
            store: (metadata) => {}
        };
        indexer = new Indexer(proven, ipfsLink, metadataGatherer, repository);
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('hooks the onDepositionPublished event on the contract', function() {
        sinon.spy(proven, 'onDepositionPublished');
        indexer.runOnce();
        expect(proven.onDepositionPublished).to.have.been.called;
    });

    it('pins the enclosure', function() {
        sinon.spy(ipfsLink, 'pinEnclosure');
        indexer.runOnce();
        expect(ipfsLink.pinEnclosure).to.have.been.calledWith(mockDeposition.ipfsHash);
    });

    it('loads the manifest', function() {
        sinon.spy(ipfsLink, 'readManifest');
        indexer.runOnce();
        expect(ipfsLink.readManifest).to.have.been.calledWith(mockDeposition.ipfsHash);
    });

    it('loads the payload', function() {
        sinon.spy(ipfsLink, 'readPayload');
        indexer.runOnce();
        expect(ipfsLink.readPayload).to.have.been.calledWith(mockDeposition.ipfsHash, mockManifest.payloadFilePath);
    });

    it('gathers metadata', function() {
        sinon.spy(metadataGatherer, 'gatherFor');
        indexer.runOnce();
        expect(metadataGatherer.gatherFor).to.have.been.calledWith(mockManifest, mockPayload);
    });

    it('stores the metadata into the repository', function() {
        sinon.spy(repository, 'store');
        indexer.runOnce();
        expect(repository.store).to.have.been.calledWith(mockMetadata);
    });
});
