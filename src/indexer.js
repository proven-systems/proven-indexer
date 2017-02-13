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
        var manifest;
        proven.onDepositionPublished(function(error, deposition) {
            if (error) {
                reject(error);
            } else {
                logger.info('Deposition published (' + deposition.ipfsHash + ')');
                ipfsLink.pinEnclosure(deposition.ipfsHash).then(function() {
                    logger.info('- Enclosure pinned');
                    return ipfsLink.readManifest(deposition.ipfsHash);
                }).then(function(_manifest) {
                    logger.info('- Manifest read');
                    manifest = _manifest;
                    return ipfsLink.getPayload(deposition.ipfsHash, 'content/' + manifest.FileName);
                }).then(function(payloadPath) {
                    logger.info('- Payload read (' + payloadPath + ')');
                    return metadataGatherer.aggregate(deposition, manifest, payloadPath);
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
