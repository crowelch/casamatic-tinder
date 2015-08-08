//var zipsMap = require('./zip_locations.json');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = 'mongodb://localhost:27017/test';

function getLocationByZip(zipCode) {
    return zipsMap[zipCode];
}

function milesToMeters(miles) {
    return miles * 1609.34;
}

function getHouses(options, callback) {
    ////var centerLocation = getLocationByZip(options.centerZip);
    ////var geoCenter = {
    ////    type : "Point",
    ////    coordinates : [parseFloat(centerLocation.Longitude) , parseFloat(centerLocation.Latitude)]
    ////};
    var radiusMeters = milesToMeters(options.milesRadius);
    MongoClient.connect(url, function (err, database) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        var houses = database.collection('houses');
        var matchingHouses = houses.find({
            listPriceValue : { $gte : options.minPrice, $lte : options.maxPrice },
            Bedrooms: { $gte: options.minBedrooms },
            FullBathrooms: { $gte: options.minBathrooms },
            loc : {
                $near: {
                    $geometry: {
                        type: "Point" ,
                        coordinates: [-84.3152 , 39.344258]
                    },
                    $maxDistance: radiusMeters
                }
            }
        });
        ////var matchingHouses = houses.find();
        callback(matchingHouses.limit(25));

    });
}

module.exports = getHouses;
