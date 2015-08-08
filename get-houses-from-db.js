var zipsMap = require('./zip_locations.json');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = 'mongodb://hack:curtis@apollo.modulusmongo.net:27017/yv3ubygU';

function getLocationByZip(zipCode) {
    return zipsMap[zipCode];
}

function milesToMeters(miles) {
    return miles * 1609.34;
}

function getHouses(options, callback) {
    var centerLocation = getLocationByZip(options.centerZip);
    var geoCenter = {
        type : "Point",
        coordinates : [parseFloat(centerLocation.longitude) , parseFloat(centerLocation.latitude)]
    };
    var radiusMeters = milesToMeters(options.milesRadius);
    MongoClient.connect(url, function (err, database) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        
        var houses = database.collection('houses');
        var matchingHouses = houses.find({
            listPriceValue : { $gte : options.minPrice, $lte : options.maxPrice },
            ListingKey: { $nin : options.alreadyDecided },
            Bedrooms: { $gte: options.minBedrooms },
            FullBathrooms: { $gte: options.minBathrooms },
            loc : {
                $near: {
                    $geometry: geoCenter,
                    $maxDistance: radiusMeters
                }
            }
        });
        callback(matchingHouses.limit(10));

    });
}

module.exports = getHouses;
