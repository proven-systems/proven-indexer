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
const ProvenRelay = require(path.join(__dirname, 'src/proven_relay'));
var IpfsLink = require(path.join(__dirname, 'src/ipfs_link'));
var MetadataGatherer = require(path.join(__dirname, 'src/metadata_gatherer'));
var Repository = require(path.join(__dirname, 'src/repository'));
const Batcher = require(path.join(__dirname, 'src/batcher'));
const Relay = require(path.join(__dirname, 'src/relay'));
var Indexer = require(path.join(__dirname, 'src/indexer'));

const options = {
    runOnce: false,
    batch: true,
    relay: true,
    index: true
};
process.argv.forEach(function(value) {
    if (value === '--once') {
        options.runOnce = true;
    } else if (value === '--nobatch') {
        options.batch = false;
    } else if (value === '--norelay') {
        options.relay = false;
    } else if (value === '--noindex') {
        options.index = false;
    }
});

var web3 = new Web3(new Web3.providers.HttpProvider(configuration.ethereum.endpoint));
var abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'res/proven_relay.abi'), 'utf8'));
var contractDefinition = web3.eth.contract(abi);
var web3Contract = contractDefinition.at(configuration.proven_relay.address);

provenRelay = new ProvenRelay(configuration, new Contract(web3, web3Contract, logger));

ipfsLink = new IpfsLink(ipfs, fs, { mkdirp: mkdirp }, logger);
metadataGatherer = new MetadataGatherer(configuration);

function runBatcher(configuration, repository, ipfsLink, provenRelay, logger) {
    return new Promise((resolve, reject) => {
        let batcher = new Batcher(configuration, repository, ipfsLink, provenRelay, logger);
        batcher.run(options).then(() => {
            logger.info('Batcher shut down');
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

MongoClient.connect(configuration.db.endpoint, function(error, db) {
    if (error) {
        logger.error(error);
        process.exit(1);
    }

    repository = new Repository(db);

    let promises = [];
    if (options.batch) {
        promises.push(runBatcher(configuration, repository, ipfsLink, provenRelay, logger));
    }

    Promise.all(promises).then(() => {
        db.close();
        process.exit(0);
    }).catch((error) => {
        logger.error(error);
        db.close();
        process.exit(1);
    });

/*
    if (options.relay) {
        let relay = new Relay(configuration, proven_relay, repository, logger);
        relay.run(options).then(function() {
            logger.info('Relay shut down');
        }).catch(function(error) {
            logger.error(error);
            process.exit(1);
        });
    }
    if (options.index) {
        let indexer = new Indexer(configuration, ipfsLink, metadataGatherer, repository, logger);
        indexer.run(options).then(function() {
            logger.info('Indexer shut down');
        }).catch(function(error) {
            logger.error(error);
            process.exit(1);
        });
    }
    */
});
