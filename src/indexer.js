var proven;
var retriever;
var repository;

function Indexer(_proven, _retriever, _repository) {
    proven = _proven;
    retriever = _retriever;
    repository = _repository;
}

Indexer.prototype.runOnce = function() {
    proven.onDepositionPublished(function(deposition) {
        var metadata = retriever.getMetadataFor(deposition.ipfsHash);
        repository.store(metadata);
    });
};

module.exports = Indexer;
