var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var Retriever = require('../src/retriever');

var sandbox;
var ipfsLink;
var metadataGatherer;
var retriever;
var fakeMetadata;
var filename = '/path/to/file';

describe('Retriever', function() {
    describe('getMetadataFor', function() {
        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            fakeMetadata = {
                tag1: 'abc',
                tag2: 'def'
            };
            ipfsLink = {
                pinFileByHash: function(ipfsHash, callback) {
                    callback();
                },
                getLocalPathByHash: function(ipfsHash, callback) {
                    callback(filename);
                }
            };
            metadataGatherer = {
                gatherFor: function(path, callback) {
                    callback(fakeMetadata);
                }
            };
            retriever = new Retriever(ipfsLink, metadataGatherer);
        });
        afterEach(function() {
            sandbox.restore();
        });

        it('pins the file in ipfs', function() {
            ipfsLink.pinFileByHash = sinon.spy();
            retriever.getMetadataFor('abcd', () => {});
            expect(ipfsLink.pinFileByHash).to.have.been.calledWith('abcd');
        });
        it('finds the local path to the file', function() {
            ipfsLink.getLocalPathByHash = sinon.spy();
            retriever.getMetadataFor('abcd', () => {});
            expect(ipfsLink.getLocalPathByHash).to.have.been.calledWith('abcd');
        });
        it('requests the metadata from the file', function() {
            metadataGatherer.gatherFor = sinon.spy();
            retriever.getMetadataFor('abcd', () => {});
            expect(metadataGatherer.gatherFor).to.have.been.calledWith(filename);
        });
        it('returns the metadata for the file', function() {
            retriever.getMetadataFor('abcd', function(metadata) {
                expect(metadata).to.eql(fakeMetadata);
            });
        });
    });
});
