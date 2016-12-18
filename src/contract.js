var Contract = function(web3Contract) {
    this.web3Contract = web3Contract;
};

Contract.prototype.watchEvent = function(name, callback) {
    var contractEvent = this.web3Contract[name]();
    contractEvent.watch(function(error, result) {
        if (error) {
            callback(error);
        } else {
            callback(null, result.args);
        }
    });
};

module.exports = Contract;
