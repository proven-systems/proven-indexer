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
        proven.onDepositionPublished(function(deposition) {
            ipfsLink.pinEnclosure(deposition.ipfsHash).then(function() {
                return ipfsLink.readManifest(deposition.ipfsHash);
            }).then(function(manifest) {
                return ipfsLink.readPayload(deposition.ipfsHash, manifest.payloadFilePath, manifest);
            }).then(function(result) {
                return metadataGatherer.gatherFor(result.manifest, result.payload);
            }).then(function(metadata) {
                return repository.store(metadata);
            }).then(function() {
                resolve();
            }).catch(function(error) {
                reject(error);
            });
        });
    });
};

module.exports = Indexer;
