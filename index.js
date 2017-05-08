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

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('proven-models');

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

provenRelay = new ProvenRelay(configuration, new Contract(web3, web3Contract, logger), logger);

ipfsLink = new IpfsLink(ipfs, fs, { mkdirp: mkdirp }, logger);
metadataGatherer = new MetadataGatherer(configuration);

function connect() {
    let options = { server: { socketOptions: { keepAlive: 1 } } };
    return mongoose.connect(configuration.db.endpoint, options).connection;
}

logger.info(JSON.stringify(options));

connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', idle);

function idle() {
    logger.info(`Database connected: ${configuration.db.endpoint}`);

    repository = new Repository(logger);

    let services = [];
    if (options.batch) {
        services.push(new Batcher(configuration, repository, ipfsLink, provenRelay, logger));
    }
    if (options.relay) {
        services.push(new Relay(configuration, provenRelay, repository, logger));
    }

    Promise
        .all(services.map(service => service.run(options)))
        .then(() => {
            logger.info('Done');
            process.exit(0);
        })
        .catch(error => {
            logger.error(error);
            process.exit(1);
        });
};
