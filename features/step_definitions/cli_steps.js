const exec = require('child_process').exec;
const expect = require('chai').expect;

var Indexer = require('../../src/indexer');

module.exports = function() {
    this.Given("an indexer", function(callback) {
        this.indexer = new Indexer();
        callback();
    });

    this.When('I run the indexer', function(callback) {
        this.indexer.runOnce();
        callback();
    });

    this.When('a deposition is published', function(callback) {
        callback(null, 'pending');
    });

    this.Then('the deposition metadata should be in the database', function(callback) {
        callback(null, 'pending');
    });
}
