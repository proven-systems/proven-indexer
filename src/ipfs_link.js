var ipfs;

function IpfsLink(_ipfs) {
    ipfs = _ipfs;
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

IpfsLink.prototype.readPayload = function(ipfsHash, filename) {
    return new Promise(function(resolve, reject) {
        ipfs.cat(ipfsHash + '/content/' + filename).then(function(stream) {
            let buffer = new Buffer([]);
            stream.on('data', function(chunk) {
                buffer = Buffer.concat([buffer, chunk]);
            });
            stream.on('end', function() {
                resolve(buffer);
            });
        }).catch(function(error) {
            reject(error);
        });
    });
};

module.exports = IpfsLink;
