var Proven = require('./proven');

module.exports = function(options) {

    this.proven = options.proven || new Proven();

    this.runOnce = function() {
        this.proven.onDepositionPublished(function(deposition) {
        });
    };
}
