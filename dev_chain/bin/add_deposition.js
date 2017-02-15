#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const multihash = require('multihashes');
const bs58 = require('bs58');

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var provenAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../res/proven.abi'), 'utf8'));
//var provenAddress = '0x3ff76874e26e00154c81854dab23d594e7fef480';
var provenAddress = '0xc34bf56a27ceab53e795eba55b9f1503eea6a771';
var Proven = web3.eth.contract(provenAbi);
var proven = Proven.at(provenAddress);
//var fromAddress = '0x0061b257BC2985c93868416f6543f76359AC1072';
var fromAddress = '0x00F28F9B9692E00feAB5A53469FC3e2972574619';

function ipfsHashStringToHexString(ipfsHash) {
    let rawIpfsHash = bs58.decode(ipfsHash);
    return new Buffer(rawIpfsHash).toString('hex');
}

var ipfsHashAsHexString = '0x' + ipfsHashStringToHexString(process.argv[2]);
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
