var db;

function Repository(_db) {
    db = _db;
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

module.exports = Repository;
