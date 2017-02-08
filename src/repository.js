var db;

function Repository(_db) {
    db = _db;
}

Repository.prototype.store = function(metadata) {
    return new Promise(function(resolve, reject) {
        var collection = db.collection('depositions');
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
    });
};

module.exports = Repository;
