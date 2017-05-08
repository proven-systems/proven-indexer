const multihash = require('multihashes');
const bs58 = require('bs58');

let configuration;
let contract;
let logger;

function ProvenRelay(_configuration, _contract, _logger) {
    configuration = _configuration;
    contract = _contract;
    logger = _logger;
}

var rawIpfsHashToIpfsHash = function(rawIpfsHash) {
    let hashText = rawIpfsHash.substr(2);
    return bs58.encode(new Buffer(hashText, 'hex'));
};

ProvenRelay.prototype.onDepositionPublished = function(callback) {
    contract.watchEvent('DepositionPublished', function(error, args, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, {
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

ProvenRelay.prototype.publishDeposition = function(batch) {
    return new Promise((resolve, reject) => {
        logger.info(JSON.stringify(batch));
        logger.info(configuration.ethereum.coinbase);
        contract.sendTransaction('publishDeposition', { max_block_count: configuration.proven_relay.max_block_count, txOptions: { from: configuration.ethereum.coinbase } }, batch.ipfsHash)
            .then(() => { resolve(batch); })
            .catch(error => { reject(error); });
    });
};

module.exports = ProvenRelay;
