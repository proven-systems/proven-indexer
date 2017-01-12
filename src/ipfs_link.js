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

module.exports = IpfsLink;
