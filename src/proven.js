var contract;

function Proven(_contract) {
    contract = _contract;
}

Proven.prototype.onDepositionPublished = function(callback) {
    contract.watchEvent('DepositionPublished', callback);
}

module.exports = Proven;
