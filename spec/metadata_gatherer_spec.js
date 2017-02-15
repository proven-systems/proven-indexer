var chai = require('chai');
var spies = require('chai-spies');
chai.use(spies);
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var MetadataGatherer = require('../src/metadata_gatherer');

describe('MetadataGatherer', function() {

    describe('aggregate', function() {

        var deposition;
        var mockManifest;
        var mockPayload;
        
        beforeEach(function() {
            deposition = {
                ipfsHash: 'abcd',
                deponent: '12345',
                deposition_id: '67890'
            };
            mockManifest = {
                "ManifestVersion":"1.0.0",
                "FileName":"IMG_20170213_234116.jpg",
                "FileHashes":"5dsF4tzo74ajDb7fSvuiVuKC6qrkWh QmZcqte3QfDGex61L5P5TCKJgqxQk53dpZBMPFTxN9BZv9 8VuQD3ryJrunXoGQvuWztaAEteyPeH2Zx7o3GSSG17qMWi5rLwqQnviMdsg6zzmFQ6r4dY4C3RE5NDGSZkXPDmkQc6",
                "BitcoinBlockNumber":452918,
                "BitcoinBlockHash":"0000000000000000000ea8d72dcde6f04fd20c58019e57d7d380a65b0f1900c7",
                "EthereumBlockNumber":3178375,
                "EthereumBlockHash":"0x0d68bd0bc4a7a8684e9eb6aaabd4bfa51cac61bdb565c7745d50673c210a5025",
                "PreviousIPFSHash":"QmZouQXwSFhyhNMsdS2zwC4HxKoezcGa48qrd5cBuznv5U",
                "PreviousFileHashes":"5dswgH2MissKSbaCXwJz9ZGhu9xXgR QmVY1yiFHXAjbwz8gGPhRt6isP69Dq3e3hvQLjuKUDt47S 8VvrTv4uNs56Ra3WHAAvgV4tuLsZQ7PxKii8UVWKbc6qb7oC6umea5ii6zBA6CiNNqpUjQ3K99uTHhPxiA2rR4HpXm",
                "GUID":"f90120af-a407-470f-a4db-a627f8f2ac91"
            };
            mockEnclosurePath = 'dev_chain/res/sample_enclosure';

            metadataGatherer = new MetadataGatherer();
        });

        it('stores the ipfs hash into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata.ipfsHash).to.eq(deposition.ipfsHash);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the filename into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata.filename).to.eq(mockManifest.FileName);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the ethereum blockchain info into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata.blockchains.ethereum.blockHash).to.eq(mockManifest.EthereumBlockHash);
                expect(metadata.blockchains.ethereum.blockNumber).to.eq(mockManifest.EthereumBlockNumber);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the guid into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata.guid).to.eq(mockManifest.GUID);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the Bitcoin blockchain info into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata.blockchains.bitcoin.blockHash).to.eq(mockManifest.BitcoinBlockHash);
                expect(metadata.blockchains.bitcoin.blockNumber).to.eq(mockManifest.BitcoinBlockNumber);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the file hashes into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata.fileHashes.sha1).to.eq(mockManifest.FileHashes);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the previous file hashes into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata.previousFileHashes).to.eq(mockManifest.PreviousFileHashes);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the previous IPFS hash into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata.previousIpfsHash).to.eq(mockManifest.PreviousIPFSHash);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the results of exiftool into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata).to.have.property('exiftool');
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('extracts image properties into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockEnclosurePath).then(function(metadata) {
                expect(metadata.createdAt).to.eq('2017:02:13 23:41:15');
                expect(metadata.cameraModel).to.eq('Nexus 6P');
                expect(metadata.imageWidth).to.eq(3024);
                expect(metadata.imageHeight).to.eq(4032);
                done();
            }).catch(function(error) {
                done(error);
            });
        });
    });
});
