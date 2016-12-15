var expect = require('chai').expect;
var Indexer = require('../src/indexer');

describe('Indexer', function() {

    var indexer;

    beforeEach(function() {
        indexer = new Indexer();
    });

    it('can be created', function() {
    });

    it('can be run once', function() {
        indexer.runOnce();
    });
});
