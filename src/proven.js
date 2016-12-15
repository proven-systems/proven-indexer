module.exports = function(contract) {
  this.contract = contract;
  this.onDepositionPublished = function(callback) {
    this.contract.watchEvent('DepositionPublished', callback);
  }
}
