var chai = require('chai');
var expect = chai.expect;

var ipfsHashPath = require('../src/ipfs_hash_path');

describe('ipfsHashPath', function() {
    describe('split', function() {

        let hash = 'abcdefg';

        it('returns a single element set to the original hash when passed level = 0', function() {
            expect(ipfsHashPath.split(hash, 0)).to.eql([hash]);
        });

        it('returns the first 2 chars split off when passed level = 1', function() {
            expect(ipfsHashPath.split(hash, 1)).to.eql([hash.substr(0, 2), hash.substr(2)]);
        });

        it('returns the first 2 sets of 2 characters split off when passed level = 2', function() {
            expect(ipfsHashPath.split(hash, 2)).to.eql([hash.substr(0, 2), hash.substr(2, 2), hash.substr(4)]);
        });
    });
});
