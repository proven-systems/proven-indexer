const path = require('path');
const ipfs_hash_path = require('./ipfs_hash_path');
const Resolver = require('ipld-resolver');
const resolver = new Resolver();
const dagCBOR = require('ipld-dag-cbor');
const multihashes = require('multihashes');

var configuration;
var repository;
let ipfsLink;
let provenRelay;
var logger;

function Batcher(_configuration, _repository, _ipfsLink, _provenRelay, _logger) {
    configuration = _configuration;
    repository = _repository;
    ipfsLink = _ipfsLink;
    provenRelay = _provenRelay;
    logger = _logger;
}

function sleep(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

function enclosuresFromDepositions(depositions) {
    return depositions.map((e) => {
        return {
            link: { '/': e.ipfsHash },
            submittedAt: e.submittedAt,
            remoteAddress: e.remoteAddress
        };
    });
}

function storeBatch(depositions) {
    return new Promise((resolve, reject) => {
        let batch = {
            batchedAt: Date().toString(),
            enclosures: depositions.map((e) => { return { link: { '/': e.ipfsHash } }; })
        };
        ipfsLink.storeBatch(batch).then((ipfsHash) => {
            resolve(ipfsHash);
        }).catch((error) => {
            reject(error);
        });
    });
}

function processDepositions(depositions) {
    if (depositions.length != 0) {
        return new Promise((resolve, reject) => {
            let ipfsHash;
            storeBatch(depositions).then((_ipfsHash) => {
                ipfsHash = _ipfsHash;
                return provenRelay.publishDeposition(ipfsHash);
            }).then(() => {
                return repository.removeDepositions(depositions);
            }).then(() => {
                resolve(ipfsHash);
            }).catch((error) => {
                reject(error);
            });
        });
    } else {
        return Promise.resolve();
    }
}

function forever(interval, action, callback) {
    (function p() {
        action((done) => {
            if (done) {
                callback();
            } else {
                setTimeout(p, interval);
            }
        });
    })();
}

function batcherAction(options) {
    return function(done) {
        logger.info('Batcher checking...');
        let depositions;
        repository.fetchAllDepositions().then((_depositions) => {
            depositions = _depositions;
            return processDepositions(_depositions);
        }).then((ipfsHash) => {
            if (ipfsHash) {
                logger.info(`Batch stored to IPFS at ${ipfsHash}`);
                depositions.forEach((d) => { logger.info(` - ${d.ipfsHash}`); });
                done(options.runOnce);
            } else {
                done();
            }
        }).catch((error) => {
            logger.error(error);
            done(options.runOnce);
        });
    };
}

Batcher.prototype.run = function(options = {}) {
    logger.info('Batcher running...');
    return new Promise((resolve, reject) => {
        forever(configuration.batcher.interval, batcherAction(options), () => { resolve(); });
    });
};

module.exports = Batcher;
