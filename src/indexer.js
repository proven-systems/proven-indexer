const path = require('path');
const ipfs_hash_path = require('./ipfs_hash_path');

var configuration;
var ipfsLink;
var metadataGatherer;
var repository;
var logger;

function Indexer(_configuration, _ipfsLink, _metadataGatherer, _repository, _logger) {
    configuration = _configuration;
    ipfsLink = _ipfsLink;
    metadataGatherer = _metadataGatherer;
    repository = _repository;
    logger = _logger;
}

Indexer.prototype.run = function(options = {}) {
    return new Promise(function(resolve, reject) {
        let enclosurePath;
        while (true) {
            repository.fetchNextDeposition().then(function(deposition) {
                logger.info('Deposition fetched (' + deposition.ipfsHash + ')');
                return ipfsLink.pinEnclosure(deposition.ipfsHash);
            }).then(function() {
                logger.info('- Enclosure pinned');
                enclosurePath = path.resolve(configuration.ipfs.cache_path, ipfs_hash_path.split(deposition.ipfsHash, 3).join('/'));
                return ipfsLink.getR(deposition.ipfsHash, enclosurePath);
            }).then(function() {
                logger.info('- Enclosure cached locally');
                return metadataGatherer.aggregate(deposition, enclosurePath);
            }).then(function(metadata) {
                logger.info('- Metadata read');
                return repository.storeIndexedDeposition(metadata);
            }).then(function() {
                logger.info('- Document stored to repository');
                if (options.once) {
                    resolve();
                }
            }).catch(function(error) {
                logger.error(error);
                if (options.once) {
                    reject(error);
                }
            });
        }
    });
};

module.exports = Indexer;
