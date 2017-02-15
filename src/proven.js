const multihash = require('multihashes');
const bs58 = require('bs58');

var contract;

function Proven(_contract) {
    contract = _contract;
}

var rawIpfsHashToIpfsHash = function(rawIpfsHash) {
    let hashText = rawIpfsHash.substr(2);
    return bs58.encode(new Buffer(hashText, 'hex'));
};

Proven.prototype.onDepositionPublished = function(callback) {
    contract.watchEvent('DepositionPublished', function(error, args, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, {
                deposition: args._deposition,
                deponent: args._deponent,
                rawIpfsHash: args._ipfs_hash,
                ipfsHash: rawIpfsHashToIpfsHash(args._ipfs_hash),
                blockHash: result.blockHash,
                blockNumber: result.blockNumber,
                transactionHash: result.transactionHash
            });
        }
    });
};

module.exports = Proven;
