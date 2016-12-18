var ipfsLink;
var metadataGatherer;

function Retriever(_ipfsLink, _metadataGatherer) {
    ipfsLink = _ipfsLink;
    metadataGatherer = _metadataGatherer;
}

Retriever.prototype.getMetadataFor = function(ipfsHash, callback) {
    ipfsLink.pinFileByHash(ipfsHash, function() {
        ipfsLink.getLocalPathByHash(ipfsHash, function(path) {
            metadataGatherer.gatherFor(path, function(metadata) {
                callback(metadata);
            });
        });
    });
}

module.exports = Retriever;
