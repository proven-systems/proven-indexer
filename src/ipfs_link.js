const path = require('path');

var ipfs;
var fs;
var mkdirp;
var logger;

function IpfsLink(_ipfs, _fs, _mkdirp, _logger) {
    ipfs = _ipfs;
    fs = _fs;
    mkdirp = _mkdirp;
    logger = _logger;
}

IpfsLink.prototype.pinEnclosure = function(ipfsHash) {
    return new Promise(function(resolve, reject) {
        ipfs.pin.add(ipfsHash, function(error, pins) {
            if (error) {
                reject(error);
            } else {
                resolve(pins);
            }
        });
    });
};

IpfsLink.prototype.get = function(hash, filePath) {
    return new Promise(function(resolve, reject) {
        ipfs.cat(hash).then(function(ipfsStream) {
            logger.info(`[ipfs cat ${hash} => ${filePath}]`);
            const fileStream = fs.createWriteStream(filePath);
            ipfsStream.pipe(fileStream);
            ipfsStream.on('end', function() {
                resolve();
            });
        });
    });
};

IpfsLink.prototype.getR = function(hash, folderPath) {
    let self = this;
    return new Promise(function(resolve, reject) {
        mkdirp.mkdirp(folderPath, function(error) {
            if (error) {
                reject(error);
            } else {
                ipfs.ls(hash).then(function(result) {
                    let promises = new Array();
                    if (!result.Objects || result.Objects.length != 1) {
                        reject(new Error(`No objects found in ${hash}`));
                    } else {
                        let links = result.Objects[0].Links;
                        for (let i = 0; i < links.length; i++) {
                            let link = links[i];
                            if (link.Type === 1) {
                                promises.push(self.getR(link.Hash, path.resolve(folderPath, link.Name)));
                            } else {
                                promises.push(self.get(link.Hash, path.resolve(folderPath, link.Name)));
                            }
                        }
                    }
                    Promise.all(promises).then(function() {
                        resolve();
                    });
                });
            }
        });
    });
};

IpfsLink.prototype.readManifest = function(ipfsHash) {
    return new Promise(function(resolve, reject) {
        ipfs.cat(ipfsHash + '/manifest.json').then(function(stream) {
            let body = '';
            stream.on('data', function(chunk) {
                body += chunk;
            });
            stream.on('end', function() {
                resolve(JSON.parse(body));
            });
        }).catch(function(error) {
            reject(error);
        });
    });
};

IpfsLink.prototype.getPayload = function(ipfsHash, filename) {
    return new Promise(function(resolve, reject) {
        var filePath = '/tmp/' + filename;
        var fileStream = fs.createWriteStream(filePath);
        ipfs.cat(ipfsHash + '/content/' + filename).then(function(stream) {
            stream.pipe(fileStream);
            stream.on('end', function() {
                resolve(filePath);
            });
        }).catch(function(error) {
            reject(error);
        });
    });
};

module.exports = IpfsLink;
