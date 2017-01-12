var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var IpfsLink = require('../src/ipfs_link');

describe('IpfsLink', function() {
    describe('pinEnclosure', function() {
        it('defers to the ipfs module', function(done) {
            var mockIpfs = {
                pin: {
                    add: (ipfsHash, callback) => {callback();}
                }
            };
            sinon.spy(mockIpfs.pin, 'add');
            var ipfsLink = new IpfsLink(mockIpfs);
            ipfsLink.pinEnclosure('abcd').then(function() {
                expect(mockIpfs.pin.add).to.have.been.calledWith('abcd');
                done();
            }).catch(function(error) {
                done(error);
            });
        });
    });
});
