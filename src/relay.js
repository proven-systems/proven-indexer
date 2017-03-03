const path = require('path');

var configuration;
var provenRelay;
var repository;
var logger;

function Relay(_configuration, _provenRelay, _repository, _logger) {
    configuration = _configuration;
    provenRelay = _provenRelay;
    repository = _repository;
    logger = _logger;
}

function processLoggedDeposition(deposition) {
    return new Promise((resolve, reject) => {
        repository.storeLoggedDeposition(deposition).then(() => {
            resolve();
        }).catch((error) => {
            logger.error(error);
        });
    });
};

Relay.prototype.run = function(options = {}) {
    logger.info('Waiting for published deposition...');
    return new Promise((resolve, reject) => {
        provenRelay.onDepositionPublished((error, deposition) => {
            if (error) {
                reject(error);
            } else {
                logger.info('Deposition published (' + deposition.ipfsHash + ')');
                processLoggedDeposition(deposition).then(() => {
                    logger.info('- Deposition record created');
                    if (options.runOnce) {
                        resolve();
                    }
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    });
};

module.exports = Relay;
