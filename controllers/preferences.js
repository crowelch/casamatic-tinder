var zippity = require('zippity-do-dah');
var geolib = require('geolib');
var firebase = require('firebase');
var myFirebase = new firebase('https://casmastic.firebaseio.com/');
var myJson = require('../secretJson/listings.json');
var _ = require('lodash');

exports.preferences = function(req, res) {
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
	var myHouses = [];
	myJson.map(function(house) {
		if(minPrice <= house.ListPrice.Value) {
			if(maxPrice >= house.ListPrice.Value) {
				if(minBedrooms <= house.Bedrooms) {
					if(minBathrooms <= house.FullBathrooms) {
						// var distance = geolib.isPointInCircle(houseLocation, userLocation, userRadius);
						// if(userDistance >= distance) {
							myHouses.push(house);
						// }
					}
				}
			}
		}
	});
	console.log(myJson.length);
	console.log(myHouses.length);
	console.log(Date.now() - startTime);
}

function zipMe(zipcode) {
	return zippity.zipcode(zipcode)
}
