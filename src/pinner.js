const path = require('path');
const ipfs_hash_path = require('./ipfs_hash_path');

var configuration;
var repository;
let ipfsLink;
let provenRelay;
var logger;

function Pinner(_configuration, _repository, _ipfsLink, _logger) {
    configuration = _configuration;
    repository = _repository;
    ipfsLink = _ipfsLink;
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
    depositions.forEach((deposition) => {
        pinDeposition(deposition).then(() => {
            return download
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

function pinnerAction(options) {
    return function(done) {
        logger.info('Pinner checking...');
        let depositions;
        repository.fetchAllLoggedDepositions().then((_depositions) => {
            depositions = _depositions;
            return processDepositions(_depositions);
        }).then(() => {
            done();
        }).catch((error) => {
            logger.error(error);
            done(options.runOnce);
        });
    };
}

Pinner.prototype.run = function(options = {}) {
    logger.info('Pinner running...');
    return new Promise((resolve, reject) => {
        forever(configuration.pinner.interval, pinnerAction(options), () => { resolve(); });
    });
};

module.exports = Pinner;
