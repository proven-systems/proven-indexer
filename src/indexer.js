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
    proven.onDepositionPublished(function(deposition) {
        ipfsLink.pinEnclosure(deposition.ipfsHash, function() {
            ipfsLink.readManifest(deposition.ipfsHash, function(manifest) {
                ipfsLink.readPayload(deposition.ipfsHash, manifest.payloadFilePath, function(payload) {
                    metadataGatherer.gatherFor(manifest, payload, function(metadata) {
                        repository.store(metadata);
                    });
                });
            });
        });
    });
};

module.exports = Indexer;
