const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const multihash = require('multi-hash');
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var provenAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'proven.abi'), 'utf8'));
var provenAddress = '0x3ff76874e26e00154c81854dab23d594e7fef480';
var Proven = web3.eth.contract(provenAbi);
var proven = Proven.at(provenAddress);
var fromAddress = '0x0061b257BC2985c93868416f6543f76359AC1072';

function sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

module.exports = function() {

    var ipfsHash;

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
        exec(path.resolve(__dirname, 'bin/start_dev_chain --daemon --geth'), function(error, stdout, stderr) {
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
        exec(path.resolve(__dirname, 'bin/add_sample_enclosure'), function(error, stdout, stderr) {
            if (error) {
                callback(error);
            } else {
                ipfsHash = multihash.decode(stdout.toString().trim()).toString('hex');
                callback();
            }
        });
    });

    this.When('I run the indexer', function(callback) {
        const child = spawn('node index.js --once', [], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        callback();
    });

    this.When('a deposition is published', {timeout: 30 * 1000}, function(callback) {
        proven.publishDeposition.sendTransaction(ipfsHash, {from: fromAddress}, function(error, txHash) {
            if (error) {
                callback(error);
            } else {
                var filter = web3.eth.filter('latest');
                filter.watch(function(error, blockHash) {
                    if (!error) {
                        var tx = web3.eth.getTransaction(txHash);
                        if (tx.blockHash) {
                            callback();
                            filter.stopWatching();
                        }
                    }
                });
            }
        });
    });

    this.Then('the deposition metadata should be in the database (after a slight delay)', function(callback) {
        callback(null, 'pending');
    });
}
