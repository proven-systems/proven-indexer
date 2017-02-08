var chai = require('chai');
var spies = require('chai-spies');
chai.use(spies);
var expect = chai.expect;

var Proven = require('../src/proven');

describe('Proven', function() {

    var mockDeposition;
    var mockContract;
    var proven;

    beforeEach(function() {
        mockDeposition = {
            _deponent: 'abcde',
            _deposition: '12345',
            _ipfs_hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
        };
        mockContract = {watchEvent: (eventName, callback) => {callback(null, mockDeposition);}};
        proven = new Proven(mockContract);
    });

    it('hooks into contract event', function(done) {
        chai.spy.on(mockContract, 'watchEvent');
        proven.onDepositionPublished(function(error, deposition) {
            expect(mockContract.watchEvent).to.have.been.called();
            done();
        });
    });

    it('responds with depositions', function(done) {
        proven.onDepositionPublished(function(error, deposition) {
            expect(deposition.deposition).to.eq(mockDeposition._deposition);
            expect(deposition.deponent).to.eq(mockDeposition._deponent);
            expect(deposition.rawIpfsHash).to.eq(mockDeposition._ipfs_hash);
            expect(deposition.ipfsHash).to.eq('QmcghNKduVKGnzFC6ZeFy1BxAdBDcVZrXLownAQaxqy26F');
            done();
        });
    });
});
