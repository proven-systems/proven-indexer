const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const multihash = require('multihashes');
const bs58 = require('bs58');

var configuration;

var MetadataGatherer = function(_configuration) {
    configuration = _configuration;
};

var ethereumBlockTimestampFromBlockHash = function(blockHash) {
    return new Promise(function(resolve, reject) {
        const Web3 = require('web3');
        const web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethereum.endpoint));
        web3.eth.getBlock(blockHash, function(error, block) {
            if (error) {
                reject(error);
            } else {
                resolve(new Date(block.timestamp * 1000));
            }
        });
    });
};

var initializeMetadataFromDeposition = function(deposition) {
    return new Promise(function(resolve, reject) {
        let metadata = {
            ipfsHash: deposition.ipfsHash,
            depositions: [{
                id: deposition.deposition,
                deponent: deposition.deponent,
                blockHash: deposition.blockHash,
                blockNumber: deposition.blockNumber,
                transactionHash: deposition.transactionHash
            }],
            indexedAt: Date().toString()
        };

        ethereumBlockTimestampFromBlockHash(deposition.blockHash).then(function(timestamp) {
            metadata.depositions[0].blockTimestamp = timestamp.toString();
            resolve(metadata);
        }).catch(function(error) {
            reject(error);
        });
    });
};

function bytesToString(bytes) {
    var result = "";
    bytes.forEach(function(b) {
        result += ('0' + b.toString(16)).slice(-2);
    });
    return result;
}

var extractFileHashes = function(fileHashes) {
    let results = {};
    fileHashes.forEach(function(hash) {
        let decoded = multihash.decode(new Buffer(bs58.decode(hash)));
        results[decoded.name] = decoded.digest.toString('hex');
    });
    return results;
}

var addMetadataFromManifest = function(metadata, enclosurePath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(path.resolve(enclosurePath, 'manifest.json'), 'utf8', function(error, data) {
            if (error) {
                reject(new Error(error));
            } else {
                manifest = JSON.parse(data);
                metadata.filename = manifest.FileName;
                metadata.guid = manifest.GUID;
                metadata.blockchains = {
                    ethereum: {
                        "blockHash": manifest.EthereumBlockHash,
                        "blockNumber": manifest.EthereumBlockNumber
                    },
                    bitcoin: {
                        "blockHash": manifest.BitcoinBlockHash,
                        "blockNumber": manifest.BitcoinBlockNumber
                    }
                };
                metadata.fileHashes = extractFileHashes(manifest.FileHashes.split(' '));
                metadata.previousFileHashes = manifest.PreviousFileHashes;
                metadata.previousIpfsHash = manifest.PreviousIPFSHash;
                resolve(metadata);
            }
        });
    });
};

var readExifTags = function(metadata, enclosurePath) {
    return new Promise(function(resolve, reject) {
        exec('exiftool -json ' + path.resolve(enclosurePath, 'content', metadata.filename), function(error, stdout, stderr) {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(stdout)[0]);
            }
        });
    });
};

var addMetadataFromExifTags = function(metadata, enclosurePath) {
    return new Promise(function(resolve, reject) {
        readExifTags(metadata, enclosurePath).then(function(exifTags) {
            metadata.createdAt = exifTags.DateTimeOriginal;
            metadata.cameraModel = exifTags.Model;
            metadata.imageWidth = exifTags.ImageWidth;
            metadata.imageHeight = exifTags.ImageHeight;
            metadata.extracts = [{
                source: 'exiftool',
                sourceVersion: exifTags.ExifToolVersion,
                extractedAt: Date().toString(),
                data: exifTags
            }];
            resolve(metadata);
        });
    });
};

MetadataGatherer.prototype.aggregate = function(deposition, enclosurePath) {
    return new Promise(function(resolve, reject) {
        initializeMetadataFromDeposition(deposition).then(function(metadata) {
            return addMetadataFromManifest(metadata, enclosurePath);
        }).then(function(metadata) {
            return addMetadataFromExifTags(metadata, enclosurePath);
        }).then(function(metadata) {
            resolve(metadata);
        });
    });
};

module.exports = MetadataGatherer;
