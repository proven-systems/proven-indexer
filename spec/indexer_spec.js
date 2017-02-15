var chai = require('chai');
var spies = require('chai-spies');
chai.use(spies);
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
    var mockDeposition = {ipfsHash: 'abcdefghijkl'};
    var mockMetadata = {filename: 'abcd', importantTag: 'efg'};

    beforeEach(function() {
        proven = {
            onDepositionPublished: (callback) => {callback(null, mockDeposition);}
        };
        ipfsLink = {
            pinEnclosure: (ipfsHash) => {return Promise.resolve();},
            getR: (ipfsHash, path) => {return Promise.resolve();},
        };
        metadataGatherer = {
            aggregate: (deposition, enclosurePath) => {return Promise.resolve(mockMetadata);}
        };
        repository = {
            store: (metadata) => {}
        };
        indexer = new Indexer(proven, ipfsLink, metadataGatherer, repository, {info: () => {}});
    });

    it('hooks the onDepositionPublished event on the contract', function(done) {
        chai.spy.on(proven, 'onDepositionPublished');
        indexer.runOnce().then(function() {
            expect(proven.onDepositionPublished).to.have.been.called();
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    it('pins the enclosure', function(done) {
        chai.spy.on(ipfsLink, 'pinEnclosure');
        indexer.runOnce().then(function() {
            expect(ipfsLink.pinEnclosure).to.have.been.called.with(mockDeposition.ipfsHash);
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    it('caches the enclosure', function(done) {
        chai.spy.on(ipfsLink, 'getR');
        indexer.runOnce().then(function() {
            expect(ipfsLink.getR).to.have.been.called.with(mockDeposition.ipfsHash, '/tmp/ipfs-cache/ipfs/ab/cd/ef/ghijkl');
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    it('gathers metadata', function(done) {
        chai.spy.on(metadataGatherer, 'aggregate');
        indexer.runOnce().then(function() {
            expect(metadataGatherer.aggregate).to.have.been.called.with(mockDeposition, '/tmp/ipfs-cache/ipfs/ab/cd/ef/ghijkl');
            done();
        }).catch(function(error) {
            done(error);
        });
    });

    it('stores the metadata into the repository', function(done) {
        chai.spy.on(repository, 'store');
        indexer.runOnce().then(function() {
            expect(repository.store).to.have.been.called.with(mockMetadata);
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

        it('rejects if there was an error caching the enclosure', function() {
            ipfsLink.getR = () => {return Promise.reject('Error in getR');}
            expect(indexer.runOnce()).to.be.rejectedWith('Error in getR');
        });

        it('rejects if there was an error gathering metadata', function() {
            metadataGatherer.aggregate = () => {return Promise.reject('Error gathering metadata');}
            expect(indexer.runOnce()).to.be.rejectedWith('Error gathering metadata');
        });

        it('rejects if there was an error storing metadata', function() {
            repository.store = () => {return Promise.reject('Error storing metadata');}
            expect(indexer.runOnce()).to.be.rejectedWith('Error storing metadata');
        });
    });
});
