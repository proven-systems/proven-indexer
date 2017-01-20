var MetadataGatherer = function() {
};

MetadataGatherer.prototype.gatherFor = function(manifest, payload) {
    return Promise.resolve({
        filename: manifest.FileName,
        ethereumBlockHash: manifest.EthereumBlockHash,
        ethereumBlockNumber: manifest.EthereumBlockNumber,
        guid: manifest.GUID,
        bitcoinBlockHash: manifest.BitcoinBlockHash,
        bitcoinBlockNumber: manifest.BitcoinBlockNumber,
        fileHashes: manifest.FileHashes,
        previousFileHashes: manifest.PreviousFileHashes,
        previousIpfsHash: manifest.PreviousIPFSHash
    });
};

module.exports = MetadataGatherer;
