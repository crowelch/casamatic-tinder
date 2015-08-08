var geolib = require('geolib');
var myJson = require('../secretJson/listings.json');
var _ = require('lodash');
//var zipsMap = require('../secretJson/zip_locations.json')

exports.preferences = function (req, res) {
	filter();
	res.render('preferences', {
		title: 'How much will you pay?'
	});
}

function filter() {
	var minPrice = 28000;
	var maxPrice = 150000;
	var minBedrooms = 2;
	var minBathrooms = 1;
	var startTime = Date.now();

    var myHouses = myJson.filter(function (house) {
        return (minPrice <= house.ListPrice.Value) 
            && (maxPrice >= house.ListPrice.Value) 
            && (minBedrooms <= house.Bedrooms) 
            && (minBathrooms <= house.FullBathrooms);
            ////&& geolib.isPointInCircle(houseLocation, userLocation, userRadius);
	});
	console.log(myJson.length);
	console.log(myHouses.length);
	console.log(Date.now() - startTime);
}
