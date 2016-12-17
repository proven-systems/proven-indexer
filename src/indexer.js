var Proven = require('./proven');

class Retriever {
    getMetadataFor() {
        console.log('WTF');
    }
}

var proven;
var retriever;

function Indexer(options) {
    proven = options.proven || new Proven();
    retriever = options.retriever || new Retriever();
}

Indexer.prototype.runOnce = function() {
    proven.onDepositionPublished(function(deposition) {
        retriever.getMetadataFor(deposition.ipfsHash);
    });
};

module.exports = Indexer;
