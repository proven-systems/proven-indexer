var proven;
var ipfsLink;
var metadataGatherer;
var repository;

function Indexer(_proven, _ipfsLink, _metadataGatherer, _repository) {
    proven = _proven;
    ipfsLink = _ipfsLink;
    metadataGatherer = _metadataGatherer;
    repository = _repository;
}

Indexer.prototype.runOnce = function() {
    return new Promise(function(resolve, reject) {
        var manifest;
        proven.onDepositionPublished(function(error, deposition) {
            if (error) {
                reject(error);
            } else {
                ipfsLink.pinEnclosure(deposition.ipfsHash).then(function() {
                    return ipfsLink.readManifest(deposition.ipfsHash);
                }).then(function(_manifest) {
                    manifest = _manifest;
                    return ipfsLink.readPayload(deposition.ipfsHash, manifest.payloadFilePath);
                }).then(function(result) {
                    return metadataGatherer.gatherFor(manifest, result.payload);
                }).then(function(metadata) {
                    return repository.store(metadata);
                }).then(function() {
                    resolve();
                }).catch(function(error) {
                    reject(error);
                });
            }
        });
    });
};

module.exports = Indexer;
