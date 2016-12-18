const exec = require('child_process').exec;
const expect = require('chai').expect;

var Indexer = require('../../src/indexer');
var Proven = require('../../src/proven');
var Retriever = require('../../src/retriever');
var Repository = require('../../src/repository');
var Contract = require('../../src/contract');

var indexer;
var abi = [{"constant":false,"inputs":[{"name":"_ipfs_hash","type":"bytes"}],"name":"publishDeposition","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"registry","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_ipfs_hash","type":"bytes"}],"name":"publishDeposition","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"}],"name":"dissolve","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_registry","type":"address"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_deposition","type":"bytes32"},{"indexed":false,"name":"_deponent","type":"address"},{"indexed":false,"name":"_ipfs_hash","type":"bytes"}],"name":"DepositionPublished","type":"event"}];
var address = '0xece7719790f26f4cac21f9ccfc27e8e5b462e6b7';

module.exports = function() {
    this.Given("an indexer", function(callback) {
        var Web3 = require('web3');
        var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        var contractDefinition = web3.eth.contract(abi);
        var web3Contract = contractDefinition.at(address);
        var options = {
            proven: new Proven(new Contract(web3Contract)),
            retriever: new Retriever(),
            repository: new Repository()
        };
        indexer = new Indexer(options);
        callback();
    });

    this.When('I run the indexer', function(callback) {
        indexer.runOnce();
        callback();
    });

    this.When('a deposition is published', function(callback) {
        callback(null, 'pending');
    });

    this.Then('the deposition metadata should be in the database', function(callback) {
        callback(null, 'pending');
    });
}
