const multihash = require('multi-hash');

var contract;

function Proven(_contract) {
    contract = _contract;
}

Proven.prototype.onDepositionPublished = function(callback) {
    contract.watchEvent('DepositionPublished', function(error, args) {
        if (error) {
            callback(error);
        } else {
            callback(null, {
                deposition: args._deposition,
                deponent: args._deponent,
                rawIpfsHash: args._ipfs_hash,
                ipfsHash: multihash.encode(args._ipfs_hash.substr(2, 64))
            });
        }
    });
};

module.exports = Proven;
