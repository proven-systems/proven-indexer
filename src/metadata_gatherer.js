const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

var MetadataGatherer = function() {
};

const depositionFieldMap = {
    ipfsHash: "ipfsHash",
    depositionId: "deposition",
    deponent: "deponent"
};

var initializeMetadataFromDeposition = function(deposition) {
    return {
        ipfsHash: deposition.ipfsHash,
        depositions: [{
            id: deposition.deposition,
            deponent: deposition.deponent,
            //publishedAt: Date.now().toString(),
            blockHash: deposition.blockHash,
            blockNumber: deposition.blockNumber,
            transactionHash: deposition.transactionHash
        }]
    };
};

var addMetadataFromManifest = function(metadata, enclosurePath, callback) {
    fs.readFile(path.resolve(enclosurePath, 'manifest.json'), 'utf8', function(error, data) {
        if (error) {
            callback(new Error(error));
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
            metadata.fileHashes = {
                sha1: manifest.FileHashes
            };
            metadata.previousFileHashes = manifest.PreviousFileHashes;
            metadata.previousIpfsHash = manifest.PreviousIPFSHash;
            callback();
        }
    });
};

var addMetadataFromExifTags = function(metadata, exifTags) {
    metadata.createdAt = exifTags.DateTimeOriginal;
    metadata.cameraModel = exifTags.Model;
    metadata.imageWidth = exifTags.ImageWidth;
    metadata.imageHeight = exifTags.ImageHeight;
    metadata.extracts = [{
        source: 'exiftool',
        sourceVersion: exifTags.ExifToolVersion,
        extractedAt: Date.now().toString(),
        data: exifTags
    }];
};

MetadataGatherer.prototype.aggregate = function(deposition, enclosurePath) {
    return new Promise(function(resolve, reject) {
        var metadata = initializeMetadataFromDeposition(deposition);
        addMetadataFromManifest(metadata, enclosurePath, function(error) {
            if (error) {
                reject(error);
            } else {
                exec('exiftool -json ' + path.resolve(enclosurePath, 'content', metadata.filename), function(error, stdout, stderr) {
                    if (error) {
                        reject(error);
                    } else {
                        var json = JSON.parse(stdout)[0];
                        addMetadataFromExifTags(metadata, json);
                        resolve(metadata);
                    }
                });
            }
        });
    });
};

module.exports = MetadataGatherer;
