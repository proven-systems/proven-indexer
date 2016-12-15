const exec = require('child_process').exec;
const expect = require('chai').expect;

module.exports = function() {
    this.Given("something", function(callback) {
        callback();
    });

    this.Given('a live database', function(callback) {
        callback();
    });

    this.When('I run the indexer with no parameters', function(callback) {
        exec('bin/proven-indexer', function(error, stdout, stderr) {
            if (error) {
                callback(error);
            } else {
                this.stdout = stdout;
                callback();
            }
        });
    });

    this.When('I run the indexer', function(callback) {
        this.indexerPid = exec('bin/proven-indexer --count 1', function(error, stdout, stderr) {
            if (error) {
                callback(error);
            } else {
                this.stdout = stdout;
                callback();
            }
        });
    });

    this.When('a deposition is published', function(callback) {
        callback(null, 'pending');
    });

    this.Then('I should see {arg1:stringInDoubleQuotes}', function(message, callback) {
        expect(this.stdout).to.include(message);
    });

    this.Then('the deposition metadata should be in the database', function(callback) {
        callback(null, 'pending');
    });
}
