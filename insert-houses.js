var housesArray = require('./secretJson/listings.json');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = 'mongodb://localhost:27017/test';

var insertDocuments = function (db, callback) {
    housesArray.forEach(function (house) {
        house.loc = {
            type : "Point",
            coordinates : [parseFloat(house.Location.Longitude) , parseFloat(house.Location.Latitude)]
        }
        house.listPriceValue = parseInt(house.ListPrice.Value)
    });

    // Get the documents collection
    var collection = db.collection('houses');
    // Insert some documents
    collection.insert(housesArray, function (err, result) {
        assert.equal(err, null);
        callback(result);
    });
}

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    insertDocuments(db, function () {
        db.close();
    });
});
