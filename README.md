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


# License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but without any warranty; without even the implied warranty of merchantability or fitness for a particular purpose.  See the [GNU Affero General Public License](http://www.gnu.org/licenses/agpl.html) for more details.
