#! /usr/bin/env node

const fs = require('fs');
var path = require('path');

const configuration = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config/config.json')))[process.env.NODE_ENV];

const mkdirp = require('mkdirp');

const winston = require('winston');
var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({json: false, timestamp: configuration.logger.timestamps}),
    ],
    exitOnError: false
});

logger.info('Initializing...');

var Web3 = require('web3');
var MongoClient = require('mongodb').MongoClient;

var IPFS = require('ipfs-api');
var ipfs = new IPFS();
var Contract = require(path.join(__dirname, 'src/contract'));
var Proven = require(path.join(__dirname, 'src/proven'));
var IpfsLink = require(path.join(__dirname, 'src/ipfs_link'));
var MetadataGatherer = require(path.join(__dirname, 'src/metadata_gatherer'));
var Repository = require(path.join(__dirname, 'src/repository'));
var Indexer = require(path.join(__dirname, 'src/indexer'));

var runOnce = false;
process.argv.forEach(function(value) {
    if (value === '--once') {
        runOnce = true;
    }
});

var web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethereum.endpoint));
var abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'res/proven.abi'), 'utf8'));
var contractDefinition = web3.eth.contract(abi);
var web3Contract = contractDefinition.at(configuration.proven.address);

proven = new Proven(new Contract(web3Contract));

ipfsLink = new IpfsLink(ipfs, fs, { mkdirp: mkdirp }, logger);
metadataGatherer = new MetadataGatherer();

MongoClient.connect(configuration.db.endpoint, function(error, db) {
    if (error) {
        logger.error(error);
        process.exit(1);
    }

    repository = new Repository(db);

    indexer = new Indexer(configuration, proven, ipfsLink, metadataGatherer, repository, logger);

    if (runOnce) {
        indexer.runOnce().then(function() {
            process.exit();
        }).catch(function(error) {
            logger.error(error);
            process.exit(1);
        });
    } else {
        indexer.run().then(function() {
            process.exit();
        }).catch(function(error) {
            logger.error(error);
            process.exit(1);
        });
    }
});
