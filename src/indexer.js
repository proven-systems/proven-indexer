var proven;
var retriever;
var repository;

function Indexer(options = {}) {
    proven = options.proven;
    retriever = options.retriever;
    repository = options.repository;
}

Indexer.prototype.runOnce = function() {
    proven.onDepositionPublished(function(deposition) {
        var metadata = retriever.getMetadataFor(deposition.ipfsHash);
        repository.store(metadata);
    });
};

module.exports = Indexer;
