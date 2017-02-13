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

var devChainPath = path.resolve(__dirname, '../../dev_chain');

function sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

var {defineSupportCode} = require('cucumber');

defineSupportCode(function({Given, When, Then}) {

    var ipfsHash;

    Given("an Ethereum blockchain in a known state", function(callback) {
        exec(path.resolve(devChainPath, 'bin/reset_dev_chain'), function(error, stdout, stderr) {
            if (error) {
                callback(error);
            } else {
                callback();
            }
        });
    });

    Given("a running Ethereum client", {timeout: 10 * 1000}, function(callback) {
        exec(path.resolve(devChainPath, 'bin/start_dev_chain --daemon --geth'), function(error, stdout, stderr) {
            if (error) {
                callback(error);
            } else {
                sleep(5000).then(function() {
                    callback();
                });
            }
        });
    });

    Given('a running miner', function(callback) {
        const child = spawn(path.resolve(devChainPath, 'bin/start_ethminer'), [], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        sleep(2000).then(function() {
            callback();
        });
    });

    Given('an initialized IPFS client', function(callback) {
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

    Given('a running IPFS daemon', function(callback) {
        const child = spawn(path.resolve(devChainPath, 'bin/start_ipfs'), [], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        sleep(3000).then(function() {
            callback();
        });
    });

    Given('a published Proven enclosure', function(callback) {
        exec(path.resolve(devChainPath, 'bin/add_sample_enclosure'), function(error, stdout, stderr) {
            if (error) {
                callback(error);
            } else {
                ipfsHash = stdout.toString().trim();
                callback();
            }
        });
    });

    When('I run the indexer', function(callback) {
        const child = spawn('node', ['index.js', '--once'], {
            stdio: 'ignore'
        });
        child.unref();
        callback();
    });

    When('a deposition is published', {timeout: 20*1000}, function(callback) {
        const child = spawn('node', [path.resolve(devChainPath, 'bin/add_deposition.js'), ipfsHash], {
            stdio: 'ignore'
        });
        child.unref();
        sleep(5000).then(function() {
            callback();
        });
    });

    Then('the deposition metadata should be in the database', {timeout: 30*1000}, function(callback) {
        sleep(20000).then(function() {
            var MongoClient = require('mongodb').MongoClient;
            MongoClient.connect('mongodb://localhost:27017/proven', function(error, db) {
                if (error) {
                    callback(error);
                } else {
                    db.collection('depositions').find({'ipfsHash': ipfsHash}).toArray(function(error, docs) {
                        if (error) {
                            callback(error);
                        } else {
                            if (docs.length == 0) {
                                callback('No documents found');
                            } else if (docs.length > 1) {
                                callback('Too many documents found');
                            } else {
                                callback();
                            }
                        }
                    });
                }
            });
        });
    });
});
