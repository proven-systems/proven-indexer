var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var Indexer = require('../src/indexer');

describe('Indexer', function() {

    var proven;
    var ipfsLink;
    var metadataGatherer;
    var repository;
    var indexer;
    var mockDeposition = {ipfsHash: 'abcd'};
    var mockManifest = {payloadFilePath: '/path/to/file'};
    var mockPayload = 'this is the payload';
    var mockMetadata = {filename: 'abcd', importantTag: 'efg'};

    beforeEach(function() {
        proven = {
            onDepositionPublished: (callback) => {callback(mockDeposition);}
        };
        ipfsLink = {
            pinEnclosure: (ipfsHash) => {return Promise.resolve();},
            readManifest: (ipfsHash) => {return Promise.resolve(mockManifest);},
            readPayload: (ipfsHash, filename, manifest) => {return Promise.resolve({manifest: manifest, payload: mockPayload});}
        };
        metadataGatherer = {
            gatherFor: (manifest, payload) => {return Promise.resolve(mockMetadata);}
        };
        repository = {
            store: (metadata) => {}
        };
        indexer = new Indexer(proven, ipfsLink, metadataGatherer, repository);
    });

    it('hooks the onDepositionPublished event on the contract', function(done) {
        sinon.spy(proven, 'onDepositionPublished');
        indexer.runOnce().then(function() {
            expect(proven.onDepositionPublished).to.have.been.called;
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    it('pins the enclosure', function(done) {
        sinon.spy(ipfsLink, 'pinEnclosure');
        indexer.runOnce().then(function() {
            expect(ipfsLink.pinEnclosure).to.have.been.calledWith(mockDeposition.ipfsHash);
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    it('loads the manifest', function(done) {
        sinon.spy(ipfsLink, 'readManifest');
        indexer.runOnce().then(function() {
            expect(ipfsLink.readManifest).to.have.been.calledWith(mockDeposition.ipfsHash);
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    it('loads the payload', function(done) {
        sinon.spy(ipfsLink, 'readPayload');
        indexer.runOnce().then(function() {
            expect(ipfsLink.readPayload).to.have.been.calledWith(mockDeposition.ipfsHash, mockManifest.payloadFilePath, mockManifest);
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    it('gathers metadata', function(done) {
        sinon.spy(metadataGatherer, 'gatherFor');
        indexer.runOnce().then(function() {
            expect(metadataGatherer.gatherFor).to.have.been.calledWith(mockManifest, mockPayload);
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    it('stores the metadata into the repository', function(done) {
        sinon.spy(repository, 'store');
        indexer.runOnce().then(function() {
            expect(repository.store).to.have.been.calledWith(mockMetadata);
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    describe('on error', function() {

        it('rejects if there was an error pinning the enclosure', function() {
            ipfsLink.pinEnclosure = () => {return Promise.reject('Error pinning enclosure');}
            expect(indexer.runOnce()).to.be.rejectedWith('Error pinning enclosure');
        });

        it('rejects if there was an error loading the manifest', function() {
            ipfsLink.readManifest = () => {return Promise.reject('Error reading manifest');}
            expect(indexer.runOnce()).to.be.rejectedWith('Error reading manifest');
        });

        it('rejects if there was an error loading the payload', function() {
            ipfsLink.readPayload = () => {return Promise.reject('Error loading payload');}
            expect(indexer.runOnce()).to.be.rejectedWith('Error loading payload');
        });

        it('rejects if there was an error gathering metadata', function() {
            metadataGatherer.gatherFor = () => {return Promise.reject('Error gathering metadata');}
            expect(indexer.runOnce()).to.be.rejectedWith('Error gathering metadata');
        });

        it('rejects if there was an error storing metadata', function() {
            repository.store = () => {return Promise.reject('Error storing metadata');}
            expect(indexer.runOnce()).to.be.rejectedWith('Error storing metadata');
        });
    });
});
