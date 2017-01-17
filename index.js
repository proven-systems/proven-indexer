#! /usr/bin/env node

var path = require('path');

var Web3 = require('web3');
var Contract = require(path.join(__dirname, 'src/contract'));
var Proven = require(path.join(__dirname, 'src/proven'));
var IpfsLink = require(path.join(__dirname, 'src/ipfs_link'));
var MetadataGatherer = require(path.join(__dirname, 'src/metadata_gatherer'));
var Repository = require(path.join(__dirname, 'src/repository'));
var Indexer = require(path.join(__dirname, 'src/indexer'));

var abi = [{"constant":false,"inputs":[{"name":"_ipfs_hash","type":"bytes"}],"name":"publishDeposition","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"registry","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_ipfs_hash","type":"bytes"}],"name":"publishDeposition","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"}],"name":"dissolve","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_registry","type":"address"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_deposition","type":"bytes32"},{"indexed":false,"name":"_deponent","type":"address"},{"indexed":false,"name":"_ipfs_hash","type":"bytes"}],"name":"DepositionPublished","type":"event"}];
var address = '0xece7719790f26f4cac21f9ccfc27e8e5b462e6b7';

var runOnce = false;
process.argv.forEach(function(value) {
    if (value === '--once') {
        runOnce = true;
    }
});

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
var contractDefinition = web3.eth.contract(abi);
var web3Contract = contractDefinition.at(address);

proven = new Proven(new Contract(web3Contract));
ipfsLink = new IpfsLink();
metadataGatherer = new MetadataGatherer();
repository = new Repository();

indexer = new Indexer(proven, ipfsLink, metadataGatherer, repository);

if (runOnce) {
    console.log('Running once!!!');
    indexer.runOnce().catch(function(error) {
        console.log(error);
    });
} else {
    console.log('Here?!?!');
    indexer.run().catch(function(error) {
        console.log(error);
    });
}
