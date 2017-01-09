const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var provenAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'proven.abi'), 'utf8'));
var provenAddress = '';
var Proven = web3.eth.contract(provenAbi);
var proven = Proven.at(provenAddress);

function sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

module.exports = function() {
    this.Given("an Ethereum blockchain in a known state", function(callback) {
        exec(path.resolve(__dirname, 'bin/reset_dev_chain'), function(error, stdout, stderr) {
            if (error) {
                callback(error);
            } else {
                callback();
            }
        });
    });

    this.Given("a running Ethereum client", function(callback) {
        exec(path.resolve(__dirname, 'bin/start_dev_chain'), function(error, stdout, stderr) {
            if (error) {
                callback(error);
            } else {
                callback();
            }
        });
    });

    this.Given('a running miner', function(callback) {
        const child = spawn(path.resolve(__dirname, 'bin/start_ethminer'), [], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        callback();
    });

    this.Given('an initialized IPFS client', function(callback) {
        exec('ipfs init', function(error, stdout, stderr) {
            if (error) {
                if (error.toString().search(/ipfs configuration file already exists/) != -1) {
                    callback();
                } else {
                    callback(error);
                }
            } else {
                callback();
            }
        });
    });

    this.Given('a running IPFS daemon', function(callback) {
        const child = spawn(path.resolve(__dirname, 'bin/start_ipfs'), [], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        sleep(3000).then(function() {
            callback();
        });
    });

    this.Given('a published Proven enclosure', function(callback) {
        exec('ipfs add -r ' + path.resolve(__dirname, 'res/sample_enclosure'), function(error, stdout, stderr) {
            if (error) {
                callback(error);
            } else {
                this.ipfsHash = stdout;
                callback();
            }
        });
    });

    this.When('I run the indexer', function(callback) {
        exec('node index.js --once', (error, stdout, stderr) => {
            if (error) {
                callback(error);
            } else {
                callback();
            }
        });
    });

    this.When('a deposition is published', function(callback) {
        proven.publishDeposition.sendTransaction(this.ipfsHash, {from: fromAddress}, function(error, txHash) {
            if (error) {
                callback(error);
            } else {
                // wait for transaction to be mined
                callback();
            }
        });
    });

    this.Then('the deposition metadata should be in the database (after a slight delay)', function(callback) {
        callback(null, 'pending');
    });
}
