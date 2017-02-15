const fs = require('fs');
var chai = require('chai');
var spies = require('chai-spies');
chai.use(spies);
var chaiJsonEqual = require('chai-json-equal');
chai.use(chaiJsonEqual);
var expect = chai.expect;

var IpfsLink = require('../src/ipfs_link');

var Readable = require('stream').Readable;
var Writable = require('stream').Writable;

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
            chai.spy.on(mockIpfs.pin, 'add');
            ipfsLink.pinEnclosure('abcd').then(function() {
                expect(mockIpfs.pin.add).to.have.been.called.with('abcd');
                done();
            }).catch(function(error) {
                done(error);
            });
        });
    });

    describe('get', function() {

        let fileStream;
        let mockIpfs;
        let ipfsLink;
        let outputStream;
        let mockFs;

        beforeEach(function() {
            fileStream = new Readable;
            fileStream.push('This is the ipfs stream');
            fileStream.push(null);
            mockIpfs = {
                cat: (hash) => { return Promise.resolve(fileStream); }
            };
            mockFs = {
                createWriteStream: (filename) => { return fs.createWriteStream('/tmp/ipfs_link_get'); }
            };

            ipfsLink = new IpfsLink(mockIpfs, mockFs);
        });

        it('defers to ipfs.cat', function(done) {
            chai.spy.on(mockIpfs, 'cat');
            ipfsLink.get('abcd', '/output/path').then(function() {
                expect(mockIpfs.cat).to.have.been.called.with('abcd');
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('opens the output file', function(done) {
            chai.spy.on(mockFs, 'createWriteStream');
            ipfsLink.get('abcd', '/output/path').then(function() {
                expect(mockFs.createWriteStream).to.have.been.called.with('/output/path');
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('copies the ipfs stream into the output file', function(done) {
            ipfsLink.get('abcd', '/output/path').then(function() {
                fs.readFile('/tmp/ipfs_link_get', 'utf-8', function(error, data) {
                    if (error) {
                        done(error);
                    } else {
                        expect(data).to.eql('This is the ipfs stream');
                        done();
                    }
                });
            }).catch(function(error) {
                done(error);
            });
        });
    });

    describe('getR', function() {

        let fileStream;
        let mockIpfs;
        let mkdirpContainer;
        let ipfsLink;

        beforeEach(function() {
            fileStream = new Readable;
            mockIpfs = {
                cat: function(hash) {
                    fileStream = new Readable;
                    fileStream.push('This is the ipfs stream');
                    fileStream.push(null);
                    return Promise.resolve(fileStream);
                },
                ls: function(hash) {
                    if (hash === 'abcd') {
                        return Promise.resolve({
                            Objects: [{
                                Links: [{
                                    Type: 1,
                                    Hash: 'abc',
                                    Name: 'def'
                                },
                                {
                                    Type: 2,
                                    Hash: 'ghi',
                                    Name: 'jkl.txt'
                                }]
                            }]
                        });
                    } else {
                        return Promise.resolve({
                            Objects: [{
                                Links: [{
                                    Type: 2,
                                    Hash: 'mno',
                                    Name: 'pqr.txt'
                                }]
                            }]
                        });
                    }
                }
            };
            mkdirpContainer = {
                mkdirp: function(path, callback) { callback(); }
            };
            ipfsLink = new IpfsLink(mockIpfs, fs, mkdirpContainer);
        });

        it('mkdirps the output path', function(done) {
            chai.spy.on(mkdirpContainer, 'mkdirp');
            ipfsLink.getR('abcd', '/output/path').then(function() {
                expect(mkdirpContainer.mkdirp).to.have.been.called.with('/output/path');
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('defers to ipfs.ls to get the folder contents', function(done) {
            chai.spy.on(mockIpfs, 'ls');
            ipfsLink.getR('abcd', '/output/path').then(function() {
                expect(mockIpfs.ls).to.have.been.called.with('abcd');
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('resolves a get for files');

        it('resolves a recursive getR for directories');
    });
});
