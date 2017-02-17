const path = require('path');
const ipfs_hash_path = require('./ipfs_hash_path');

var configuration;
var proven;
var ipfsLink;
var metadataGatherer;
var repository;
var logger;

function Indexer(_configuration, _proven, _ipfsLink, _metadataGatherer, _repository, _logger) {
    configuration = _configuration;
    proven = _proven;
    ipfsLink = _ipfsLink;
    metadataGatherer = _metadataGatherer;
    repository = _repository;
    logger = _logger;
}

Indexer.prototype.runOnce = function() {
    return this.run({ once: true });
};

Indexer.prototype.run = function(options = {}) {
    return new Promise(function(resolve, reject) {
        var enclosurePath;
        proven.onDepositionPublished(function(error, deposition) {
            if (error) {
                reject(error);
            } else {
                logger.info('Deposition published (' + deposition.ipfsHash + ')');
                ipfsLink.pinEnclosure(deposition.ipfsHash).then(function() {
                    logger.info('- Enclosure pinned');
                    enclosurePath = path.resolve(configuration.ipfs.cache_path, ipfs_hash_path.split(deposition.ipfsHash, 3).join('/'));
                    return ipfsLink.getR(deposition.ipfsHash, enclosurePath);
                }).then(function() {
                    logger.info('- Enclosure cached locally');
                    return metadataGatherer.aggregate(deposition, enclosurePath);
                }).then(function(metadata) {
                    logger.info('- Metadata read');
                    return repository.store(metadata);
                }).then(function() {
                    logger.info('- Document stored to repository');
                    if (options.once) {
                        resolve();
                    }
                }).catch(function(error) {
                    reject(error);
                });
            }
        });
        logger.info('Waiting for published deposition...');
    });
};

module.exports = Indexer;
