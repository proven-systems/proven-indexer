var chai = require('chai');
var spies = require('chai-spies');
chai.use(spies);
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var Repository = require('../src/repository');

describe('Repository', function() {

    describe('store', function() {

        var mockCollection;
        var mockDb;
        var mockMetadata;
        var repository;
        
        beforeEach(function() {
            mockCollection = {
                insertOne: (document, callback) => {callback(null,{insertedCount: 1})}
            };
            mockDb = {
                collection: (name) => {return mockCollection;}
            };
            mockMetadata = {
            };

            repository = new Repository(mockDb);
        });

        it('uses the depositions collection', function(done) {
            chai.spy.on(mockDb, 'collection');
            repository.store(mockMetadata).then(function() {
                expect(mockDb.collection).to.have.been.called.with('depositions');
                done();
            }).catch(function(error) {
                done(error);
            });
        });

        it('inserts into the collection', function(done) {
            chai.spy.on(mockCollection, 'insertOne');
            repository.store(mockMetadata).then(function() {
                expect(mockCollection.insertOne).to.have.been.called.with(mockMetadata);
                done();
            }).catch(function(error) {
                done(error);
            });
        });
    });
});
