const path = require('path');
const ipfs_hash_path = require('./ipfs_hash_path');
const forever = require('./forever');

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
            enclosures: depositions.map(e => ({ link: { '/': e.ipfsHash }}))
        };
        ipfsLink.storeBatch(batch)
            .then(ipfsHash => { resolve({ ipfsHash: ipfsHash, depositions: depositions }); })
            .catch(error => { reject(error); });
    });
}

const processDepositions = (depositions) => {
    return new Promise((resolve, reject) => {
        logger.info('Batcher processing...');
        if (depositions.length != 0) {
            storeBatch(depositions)
                .then(batch => provenRelay.publishDeposition(batch))
                .then(batch => repository.removeDepositions(batch))
                .then(batch => { resolve(batch); })
                .catch(error => { reject(error); });
        } else {
            resolve({ depositions: depositions });
        }
    });
}

const batcherAction = (options) => {
    return (done) => {
        logger.info('Batcher checking...');
        repository.fetchAllDepositions()
            .then(depositions => processDepositions(depositions))
            .then(({ ipfsHash, depositions }) => {
                if (ipfsHash) {
                    logger.info(`Batch stored to IPFS at ${ipfsHash}`);
                    depositions.forEach((d) => { logger.info(` - ${d.ipfsHash}`); });
                    done(options.runOnce);
                } else {
                    done();
                }
            })
            .catch(error => {
                logger.error(error);
                done(options.runOnce);
            });
    };
}

Batcher.prototype.run = function(options = {}) {
    return new Promise((resolve, reject) => {
        logger.info('Batcher running...');
        forever(configuration.batcher.interval, batcherAction(options), () => { resolve(); });
    });
};

module.exports = Batcher;
