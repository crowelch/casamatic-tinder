var geolib = require('geolib');
var housesArray = require('../secretJson/listings.json');
var zipsMap = require('./zip_locations.json')


function getLocationByZip(zipCode) {
    return zipsMap[zipCode];
}

function milesToMeters(miles) {
    return miles * 1609.34;
}

function getHouses(options) {
    var centerLocation = getLocationByZip(options.centerZip);
    var radiusMeters = milesToMeters(options.milesRadius);
    var matchingHouses = housesArray.filter(function (house) {
        var houseLocation = { latitude: house.Location.Latitude, longitude: house.Location.Longitude };
        return (options.minPrice <= house.ListPrice.Value) 
            && (options.maxPrice >= house.ListPrice.Value) 
            && (options.minBedrooms <= house.Bedrooms) 
            && (options.minBathrooms <= house.FullBathrooms) 
            && geolib.isPointInCircle(houseLocation, centerLocation, radiusMeters);
    });
    return matchingHouses.slice(0, 25);
}

module.exports = getHouses;