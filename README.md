[![Build Status](https://travis-ci.org/proven-systems/proven-indexer.svg?branch=master)](https://travis-ci.org/proven-systems/proven-indexer)

# proven-indexer

The Proven Indexer watches the Ethereum blockchain transaction logs for new depositions that need verification.

Process overview:
* watches the transaction log for *DepositionPublished* events on the [Proven contract](https://github.com/proven-systems/proven-eth/blob/master/contracts/Proven.sol#L18)
* fetches the IPFS payload locally and pins it so it doesn't disappear
* extracts EXIF metadata from the payload
* records each event in a local database

## Prerequisites

* exiftool (`sudo apt-get install libimage-exiftool-perl`)
* mongodb (`sudo apt-get install mongodb`)
* [nvm](https://github.com/creationix/nvm) (`curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash`)
* `nvm install node`


## Development

    $> npm install
    $> export DEV_CHAIN_ROOT=`pwd`/dev_chain
    $> chmod 400 dev_chain/etc/coinbase_password

## Running

    Set up `config/config.json` based on `config/config.sample.json`
    $> export NODE_ENV=development
    $> node index.js

### Tests

    $> npm test

### Cucumber Specs

    $> npm run spec
