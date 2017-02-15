const path = require('path');
const ipfs_hash_path = require('./ipfs_hash_path');

var proven;
var ipfsLink;
var metadataGatherer;
var repository;
var logger;

function Indexer(_proven, _ipfsLink, _metadataGatherer, _repository, _logger) {
    proven = _proven;
    ipfsLink = _ipfsLink;
    metadataGatherer = _metadataGatherer;
    repository = _repository;
    logger = _logger;
}

Indexer.prototype.runOnce = function() {
    return new Promise(function(resolve, reject) {
        var enclosurePath;
        proven.onDepositionPublished(function(error, deposition) {
            if (error) {
                reject(error);
            } else {
                logger.info('Deposition published (' + deposition.ipfsHash + ')');
                ipfsLink.pinEnclosure(deposition.ipfsHash).then(function() {
                    logger.info('- Enclosure pinned');
                    enclosurePath = path.resolve('/tmp/ipfs-cache/ipfs', ipfs_hash_path.split(deposition.ipfsHash, 3).join('/'));
                    return ipfsLink.getR(deposition.ipfsHash, enclosurePath);
                }).then(function() {
                    logger.info('- Enclosure cached locally');
                    return metadataGatherer.aggregate(deposition, enclosurePath);
                }).then(function(metadata) {
                    logger.info('- Metadata read');
                    return repository.store(metadata);
                }).then(function() {
                    logger.info('- Document stored to repository');
                    resolve();
                }).catch(function(error) {
                    reject(error);
                });
            }
        });
        logger.info('Waiting for published deposition...');
    });
};

module.exports = Indexer;
