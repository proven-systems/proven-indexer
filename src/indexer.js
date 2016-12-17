var Proven = require('./proven');

var proven;
var retriever;
var repository;

function Indexer(options) {
    proven = options.proven || new Proven();
    retriever = options.retriever || new Retriever();
    repository = options.repository || new Repository();
}

Indexer.prototype.runOnce = function() {
    proven.onDepositionPublished(function(deposition) {
        var metadata = retriever.getMetadataFor(deposition.ipfsHash);
        repository.store(metadata);
    });
};

module.exports = Indexer;
