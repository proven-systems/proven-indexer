const exec = require('child_process').exec;

module.exports = function() {
    this.Before(function() {
        return true;
    });

    this.After(function() {
        exec("kill `ps -ef | grep parity | awk '{print $2}'`", function(error, stdout, stderr) {
        });
        exec("kill `ps -ef | grep ethminer | awk '{print $2}'`", function(error, stdout, stderr) {
        });
        exec("kill `ps -ef | grep 'ipfs daemon' | awk '{print $2}'`", function(error, stdout, stderr) {
        });
        return true;
    });
}
