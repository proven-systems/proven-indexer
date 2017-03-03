let web3;
let web3Contract;
let logger;

var Contract = function(_web3, _web3Contract, _logger) {
    web3 = _web3;
    web3Contract = _web3Contract;
    logger = _logger;
};

Contract.prototype.watchEvent = function(name, callback) {
    var contractEvent = web3Contract[name]();
    contractEvent.watch(function(error, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, result.args, result);
        }
    });
};

Contract.prototype.sendTransaction = function(method, options, ...parameters) {
    return new Promise((resolve, reject) => {
        web3Contract[method].sendTransaction(...parameters, options.txOptions, (error, txHash) => {
            if (error) {
                reject(error);
            } else {
                let filter = web3.eth.filter('latest');
                let blockCount = 0;
                filter.watch((error, blockHash) => {
                    if (error) {
                        reject(error);
                    } else {
                        let tx = web3.eth.getTransaction(txHash);
                        if (tx.blockHash) {
                            filter.stopWatching();
                            resolve();
                        } else {
                            logger.info('Block mined that did not include our transaction');
                            blockCount += 1;
                            if (options.max_block_count && blockCount >= options.max_block_count) {
                                filter.stopWatching();
                                reject(new Error(`Maximum block count (${configuration.proven_relay.max_block_count}) reached without deposition transaction being mined`));
                            }
                        }
                    }
                });
            }
        });
    });
}

module.exports = Contract;
