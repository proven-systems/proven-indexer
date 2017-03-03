const path = require('path');

var configuration;
var proven_relay;
var repository;
var logger;

function Relay(_configuration, _proven_relay, _repository, _logger) {
    configuration = _configuration;
    proven_relay = _proven_relay;
    repository = _repository;
    logger = _logger;
}

Relay.prototype.run = function(options = {}) {
    return new Promise(function(resolve, reject) {
        proven_relay.onDepositionPublished(function(error, deposition) {
            if (error) {
                reject(error);
            } else {
                logger.info('Deposition published (' + deposition.ipfsHash + ')');
                repository.storeDeposition(deposition).then(function() {
                    logger.info('- Deposition record created');
                    if (options.once) {
                        resolve();
                    }
                }).catch(function(error) {
                    logger.error(error);
                    if (options.once) {
                        reject(error);
                    }
                });
            }
        });
        logger.info('Waiting for published deposition...');
    });
};

module.exports = Relay;
