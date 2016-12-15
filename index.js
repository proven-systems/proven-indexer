#! /usr/bin/env node

var path = require('path');
var Indexer = require(path.join(__dirname, 'src/indexer'));
var indexer = new Indexer();

indexer.runOnce();
