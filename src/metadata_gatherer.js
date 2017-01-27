const exec = require('child_process').exec;

var MetadataGatherer = function() {
};

MetadataGatherer.prototype.gatherFor = function(manifest, payloadPath) {
    return new Promise(function(resolve, reject) {
        var metadata = {
            filename: manifest.FileName,
            ethereumBlockHash: manifest.EthereumBlockHash,
            ethereumBlockNumber: manifest.EthereumBlockNumber,
            guid: manifest.GUID,
            bitcoinBlockHash: manifest.BitcoinBlockHash,
            bitcoinBlockNumber: manifest.BitcoinBlockNumber,
            fileHashes: manifest.FileHashes,
            previousFileHashes: manifest.PreviousFileHashes,
            previousIpfsHash: manifest.PreviousIPFSHash
        };

        exec('exiftool -json ' + payloadPath, function(error, stdout, stderr) {
            if (error) {
                reject(error);
            } else {
                var json = JSON.parse(stdout)[0];
                metadata.exiftool = json;
                metadata.createdAt = json.DateTimeOriginal;
                metadata.cameraModel = json.Model;
                metadata.imageWidth = json.ImageWidth;
                metadata.imageHeight = json.ImageHeight;
                resolve(metadata);
            }
        });
    });
};

module.exports = MetadataGatherer;
