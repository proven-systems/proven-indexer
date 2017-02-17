#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const multihash = require('multihashes');
const bs58 = require('bs58');

const configuration = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../config/config.json'), 'utf8')).development;

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethereum.endpoint));

var provenAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../res/proven.abi'), 'utf8'));
var Proven = web3.eth.contract(provenAbi);
var proven = Proven.at(configuration.proven.address);

function ipfsHashStringToHexString(ipfsHash) {
    let rawIpfsHash = bs58.decode(ipfsHash);
    return new Buffer(rawIpfsHash).toString('hex');
}

var ipfsHashAsHexString = '0x' + ipfsHashStringToHexString(process.argv[2]);
console.log(ipfsHashAsHexString);

proven.publishDeposition.sendTransaction(ipfsHashAsHexString, {from: configuration.ethereum.coinbase}, function(error, txHash) {
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
