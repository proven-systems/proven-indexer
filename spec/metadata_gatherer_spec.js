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
                FileName: 'Louie.jpeg',
                EthereumBlockHash: '0xe7f9a8373326ecb3240b0c6743c4792da4a17207cf0da4056c3fad94766fc62f',
                EthereumBlockNumber: 2777500,
                GUID: '3a4334be-e41f-49c8-8518-340f74277606',
                BitcoinBlockHash: '0000000000000000036d5a7173fa75185a5f7b60195d3bac03ecef3e971c1637',
                BitcoinBlockNumber: 442677,
                FileHashes: '84C5B7886D243D0ADBB3C707B629F3BF',
                PreviousFileHashes: '84C5B7886D243D0ADBB3C707B629F3C0',
                PreviousIPFSHash: 'Qmb7Uwc39Q7YpPsfkWj54S2rMgdV6D845Sgr75GyxZfV4W'
            };
            mockPayloadPath = 'dev_chain/res/sample_enclosure/content/Louie.jpeg';

            metadataGatherer = new MetadataGatherer();
        });

        it('stores the ipfs hash into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata.ipfsHash).to.eq(deposition.ipfsHash);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the filename into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata.filename).to.eq(mockManifest.FileName);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the ethereum blockchain info into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata.blockchains.ethereum.blockHash).to.eq(mockManifest.EthereumBlockHash);
                expect(metadata.blockchains.ethereum.blockNumber).to.eq(mockManifest.EthereumBlockNumber);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the guid into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata.guid).to.eq(mockManifest.GUID);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the Bitcoin blockchain info into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata.blockchains.bitcoin.blockHash).to.eq(mockManifest.BitcoinBlockHash);
                expect(metadata.blockchains.bitcoin.blockNumber).to.eq(mockManifest.BitcoinBlockNumber);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the file hashes into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata.fileHashes.sha1).to.eq(mockManifest.FileHashes);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the previous file hashes into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata.previousFileHashes).to.eq(mockManifest.PreviousFileHashes);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the previous IPFS hash into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata.previousIpfsHash).to.eq(mockManifest.PreviousIPFSHash);
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('stores the results of exiftool into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata).to.have.property('exiftool');
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('extracts image properties into the metadata', function(done) {
            metadataGatherer.aggregate(deposition, mockManifest, mockPayloadPath).then(function(metadata) {
                expect(metadata.createdAt).to.eq('2016:12:01 17:59:16');
                expect(metadata.cameraModel).to.eq('HD Pro Webcam C920');
                expect(metadata.imageWidth).to.eq(1920);
                expect(metadata.imageHeight).to.eq(1080);
                done();
            }).catch(function(error) {
                done(error);
            });
        });
    });
});
