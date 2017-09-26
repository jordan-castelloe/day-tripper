$(document).ready(function(){

var geocoder;
var map;
var location;
var myLocation;
var lat;
var long;
var newLat;
var newLong;
var radius;
var distance;
var LatLng;
var points = [];
var places = [];
var types = ["store", "restaurant", "amusement_park", "museum", "zoo"];
var numberOfPoints = 20;
var count;



getLocation();


//find the user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Uh oh! Geolocation is not supported by this browser.");
    }
}


// if geolocation is successful, set variables to their location and call the showMap function and
function success(pos) {
  myLocation = pos.coords;
  lat = myLocation.latitude;
  long = myLocation.longitude;
  showMap();
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

//print map 
function showMap(){
  location= {center:new google.maps.LatLng(lat, long), zoom : 7};
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById("googleMap"),location);
};


//geolocate an address, convert to LatLng
function codeAddress() {
    var address = $("#choose-location").val();
    geocoder.geocode( {'address': address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      };
      });
    };
 



function findCoordinates(lat, lang, radius){
    
    var degreesPerPoint = 360/numberOfPoints;

    // Keep track of the angle from centre to radius
    var currentAngle = 0;


    for(var i=0; i < numberOfPoints; i++){
        // X2 point will be cosine of angle * radius
        var x2 = Math.cos(currentAngle) * radius;
        // Y2 point will be sin * radius
        var y2 = Math.sin(currentAngle) * radius;

      newLat= lat + x2;
      newLong = lang + y2;
      LatLng = new google.maps.LatLng({lat: newLat, lng: newLong}); 
    // save to our results array
      points.push(LatLng);

        // Shift our angle around for the next point
    currentAngle += degreesPerPoint;
    };
};


function search(){

var service = new google.maps.places.PlacesService(map);
for (var i = 0; i < types.length; i++){
  var typeValue = types[i];
  placesSearch();


function placesSearch(){
for (var i = 0; i < numberOfPoints; i++){
  var currentPoint = points[i];
    service.nearbySearch({
    location: currentPoint,
    radius: '5000',
    type: [typeValue],
  }, placesSearchCallback);
  getDistance(currentPoint);
}
}


// if the search works, make markers for all the results
function placesSearchCallback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var placeId = results[i].place_id;
      createMarker(results[i]);
      
    }
  }
}
}
}



function createMarker(place) {
  var service = new google.maps.places.PlacesService(map);
  var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });
  var infowindow = new google.maps.InfoWindow();
  google.maps.event.addListener(marker, 'click', function() {
      var request = {
                reference: place.reference
            };
            service.getDetails(request, function(details, status) {
            infowindow.setContent([
                details.name, 
                details.formatted_address,
                details.rating].join("<br />"))
              infowindow.open(map, marker);
            });
          })
      }



function getDistance(destination){
var origin = new google.maps.LatLng({lat: lat, lng: long});
var service = new google.maps.DistanceMatrixService();
service.getDistanceMatrix(
  {
    origins: [origin],
    destinations: [destination],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.IMPERIAL,
  }, getDistanceCallback);
}

function getDistanceCallback(response, status) {
  if (status == 'OK') {
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;

    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        var distance = element.distance.text;
        var duration = element.duration.text;
        var from = origins[i];
        var to = destinations[j];
  
      }
    }
    return duration;
  }
}

// search for other locations
$("#location-search").click(function(){
  codeAddress();
});
  

// search for results
$("#final-search").click(function(){

//set up starting location variable
if ($("#my-location").prop('checked', true)){
  console.log(location);
} else if ($("#another-location").prop('checked', true)){
  codeAddress();
  var newCenter = map.getCenter();
  lat = newCenter.lat();
  long = newCenter.lng();
}

//set up radius variable
distance = $("#distance").val();
if (distance == null){
  alert("Please choose a radius for your search!");
} else if (distance == 1){
  radius = 0.7;
} else if (distance == 2){
  radius = 1.4;
} else if (distance == 3){
  radius = 1.8;
} else if (distance == 4){
  radius = 2.4;
}
 
findCoordinates(lat, long, radius);
search();


});
});




/*

//do a nearby search. We'll end up doing this for points generated with the findCoordiantes function
function searchStores(){
service = new google.maps.places.PlacesService(map);
for (var i = 0; i < numberOfPoints; i++){
    service.nearbySearch({
    location: points[i],
    radius: '5000',
    type: ['store'],
  }, searchStoresCallback);
  getDistance(points[i]);
}
}

// if the search works, make markers for all the results
function searchStoresCallback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      stores.push(results[i]);

    }
  }
}

function searchRestaurants(){
service = new google.maps.places.PlacesService(map);
for (var i = 0; i < numberOfPoints; i++){
    service.nearbySearch({
    location: points[i],
    radius: '5000',
    type: ['restaurant'],
  }, searchRestaurantsCallback);
  getDistance(points[i]);
}
}


// if the search works, make markers for all the results
function searchRestaurantsCallback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      restaurants.push(results[i]);

    }
  }
}

function searchAmusementParks(){
service = new google.maps.places.PlacesService(map);
for (var i = 0; i < numberOfPoints; i++){
    service.nearbySearch({
    location: points[i],
    radius: '5000',
    type: ['amusement_park'],
  }, searchAmusementParksCallback);
  getDistance(points[i]);
}
}


// if the search works, make markers for all the results
function searchAmusementParksCallback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      amusementParks.push(results[i]);

    }
  }
}

function searchParks(){
service = new google.maps.places.PlacesService(map);
for (var i = 0; i < numberOfPoints; i++){
    service.nearbySearch({
    location: points[i],
    radius: '5000',
    type: ['park'],
  }, searchParksCallback);
  getDistance(points[i]);
}
}


// if the search works, make markers for all the results
function searchParksCallback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      parks.push(results[i]);

    }
  }
}

function searchMuseums(){
service = new google.maps.places.PlacesService(map);
for (var i = 0; i < numberOfPoints; i++){
    service.nearbySearch({
    location: points[i],
    radius: '5000',
    type: ['museum'],
  }, searchMuseumsCallback);
  getDistance(points[i]);
}
}


// if the search works, make markers for all the results
function searchMuseumsCallback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      museums.push(results[i]);

    }
  }
}

function searchZoos(){
service = new google.maps.places.PlacesService(map);
for (var i = 0; i < numberOfPoints; i++){
    service.nearbySearch({
    location: points[i],
    radius: '5000',
    type: ['zoo'],
  }, searchZoosCallback);
  getDistance(points[i]);
}
}


// if the search works, make markers for all the results
function searchZoosCallback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      zoos.push(results[i]);

    }
  }
}

*/