#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const multihash = require('multi-hash');

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var provenAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../res/proven.abi'), 'utf8'));
var provenAddress = '0x3ff76874e26e00154c81854dab23d594e7fef480';
var Proven = web3.eth.contract(provenAbi);
var proven = Proven.at(provenAddress);
var fromAddress = '0x0061b257BC2985c93868416f6543f76359AC1072';

function bytesToString(bytes) {
    var result = "";
    bytes.forEach(function(b) {
        result += b.toString(16);
    });
    return result;
}

var ipfsHash = process.argv[2];
var ipfsHashAsBytes = multihash.decode(ipfsHash);
var ipfsHashAsHexString = '0x' + bytesToString(ipfsHashAsBytes);
console.log(ipfsHashAsHexString);

proven.publishDeposition.sendTransaction(ipfsHashAsHexString, {from: fromAddress}, function(error, txHash) {
    console.log('Transaction sent...');
    if (error) {
        console.log(error);
        process.exit(1);
    } else {
        var filter = web3.eth.filter('latest');
        filter.watch(function(error, blockHash) {
            if (!error) {
                console.log('Found latest mined block...');
                var tx = web3.eth.getTransaction(txHash);
                if (tx.blockHash) {
                    console.log('Transaction mined.');
                    filter.stopWatching();
                    process.exit(0);
                }
            }
        });
    }
});
