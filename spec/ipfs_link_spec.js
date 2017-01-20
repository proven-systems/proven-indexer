var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var chaiJsonEqual = require('chai-json-equal');
chai.use(chaiJsonEqual);

var IpfsLink = require('../src/ipfs_link');

var Readable = require('stream').Readable;

describe('IpfsLink', function() {

    describe('pinEnclosure', function() {

        var mockIpfs;
        var ipfsLink;

        beforeEach(function() {
            mockIpfs = {
                pin: {
                    add: (ipfsHash, callback) => {callback();}
                }
            };

            ipfsLink = new IpfsLink(mockIpfs);
        });

        it('defers to the ipfs module', function(done) {
            sinon.spy(mockIpfs.pin, 'add');
            ipfsLink.pinEnclosure('abcd').then(function() {
                expect(mockIpfs.pin.add).to.have.been.calledWith('abcd');
                done();
            }).catch(function(error) {
                done(error);
            });
        });
    });

    describe('readManifest', function() {

        const manifestJSON = { key1: 'value1', key2: 'value2' };
        var manifestStream;
        var mockIpfs;
        var ipfsLink;

        beforeEach(function() {
            manifestStream = new Readable;
            manifestStream.push(JSON.stringify(manifestJSON));
            manifestStream.push(null);

            mockIpfs = {
                cat: (ipfsHash) => { return Promise.resolve(manifestStream); }
            };

            ipfsLink = new IpfsLink(mockIpfs);
        });

        it('defers to the ipfs module', function(done) {
            sinon.spy(mockIpfs, 'cat');
            ipfsLink.readManifest('abcd').then(function(manifest) {
                expect(mockIpfs.cat).to.have.been.calledWith('abcd/manifest.json');
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('returns the JSONified manifest', function(done) {
            ipfsLink.readManifest('abcd').then(function(manifest) {
                expect(manifest).to.jsonEqual(manifestJSON);
                done();
            }).catch(function(error) {
                done(error);
            });
        });
    });

    describe('readPayload', function() {

        const dummyPayload = 'This is the payload';
        var payloadStream;
        var mockIpfs;
        var ipfsLink;

        beforeEach(function() {
            payloadStream = new Readable;
            payloadStream.push(dummyPayload);
            payloadStream.push(null);

            mockIpfs = {
                cat: (ipfsHash) => { return Promise.resolve(payloadStream); }
            };

            ipfsLink = new IpfsLink(mockIpfs);
        });

        it('defers to the ipfs module', function(done) {
            sinon.spy(mockIpfs, 'cat');
            ipfsLink.readPayload('abcd', 'filename').then(function(payload) {
                expect(mockIpfs.cat).to.have.been.calledWith('abcd/content/filename');
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('returns a buffer of the file', function(done) {
            ipfsLink.readPayload('abcd', 'filename').then(function(payload) {
                expect(Buffer.compare(payload, new Buffer(dummyPayload))).to.eq(0);
                done();
            }).catch(function(error) {
                done(error);
            });
        });
    });
});
