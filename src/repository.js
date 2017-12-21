const pm = require('proven-models');
const mongoose = require('mongoose');
const DepositionRequest = mongoose.model('DepositionRequest');

let logger;

function Repository(_logger) {
    logger = _logger;
}

Repository.prototype.store = function(metadata) {
    return new Promise(function(resolve, reject) {
        var collection = db.collection('depositions');
        collection.find({ guid: metadata.guid }).toArray(function(error, docs) {
            if (error) {
                reject(error);
            } else {
                if (docs.length == 0) {
                    collection.insertOne(metadata, function(error, result) {
                        if (error) {
                            reject(error);
                        } else {
                            if (result.insertedCount != 1) {
                                reject('Unexpected insertedCount');
                            } else {
                                resolve();
                            }
                        }
                    });
                } else {
                    collection.updateOne({ guid: metadata.guid }, { $push: { "depositions": metadata.depositions[0] } }, function(error, result) {
                        if (error) {
                            reject(error);
                        } else {
                            if (result.matchedCount != 1 && result.modifiedCount != 1) {
                                reject(new Error('Unexpected results of update'));
                            } else {
                                resolve();
                            }
                        }
                    });
                }
            }
        });
    });
};

Repository.prototype.storeDeposition = function(deposition) {
    return new Promise(function(resolve, reject) {
        var collection = db.collections('depositions');
        collection.insertOne(deposition, function(error, result) {
            if (error) {
                reject(error);
            } else {
                if (result.insertedCount != 1) {
                    reject(new Error('Unexpected insertedCount inserting relayed deposition'));
                } else {
                    resolve();
                }
            }
        });
    });
};

Repository.prototype.storeLoggedDeposition = function(deposition) {
    return new Promise((resolve, reject) => {
        var collection = db.collection('loggedDepositions');
        collection.insertOne(deposition).then((result) => {
            if (result.insertedCount != 1) {
                reject(new Error('Unexpected insertedCount inserting relayed deposition'));
            } else {
                resolve(result.insertedId);
            }
        }).catch((error) => {
            reject(error);
        });
    });
};

Repository.prototype.fetchAllLoggedDepositions = function() {
    return new Promise((resolve, reject) => {
        const collection = db.collection('loggedDepositions');
        collection.find().toArray((error, docs) => {
            if (error) {
                reject(error);
            } else {
                resolve(docs);
            }
        });
    });
};

Repository.prototype.fetchAllDepositions = () => {
    return new Promise((resolve, reject) => {
        DepositionRequest.find()
            .then(depositions => { resolve(depositions); })
            .catch(error => { reject(error); });
    });
};

// TODO: This removes all depositions - just remove the ones in the batch
Repository.prototype.removeDepositions = function(batch) {
    return new Promise((resolve, reject) => {
        DepositionRequest.remove({_id: { $in: batch.depositions.map(d => d._id) }}, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve(batch);
            }
        });
    });
};

/*
Repository.prototype.fetchNextDeposition = function() {
    return new Promise(function(resolve, reject) {
        const collection = db.collection('depositions');
        collection.find({ guid: { $exists: false } }, { limit: 1 }).toArray(function(error, docs) {
            if (error) {
                reject(error);
            } else {
                if (docs.length == 1) {
                    resolve(docs[ 0 ]);
                } else {
                    return fetchNextDeposition
            }
        });
    });
};
*/

module.exports = Repository;
