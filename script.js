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
var drivingDistance;
var LatLng;
var points = [];
var places = [];
var types = ["store", "restaurant", "amusement_park", "museum", "zoo"];
var numberOfPoints = 40;
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
  location = pos.coords;
  lat = location.latitude;
  long = location.longitude;
  showMap();
};

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};


function showMap() {
    map = new google.maps.Map(document.getElementById('googleMap'), {
    zoom: 6,
    center: {lat: lat, lng: long},
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true
  });
  var marker = new google.maps.Marker({
          map: map,
          position: map.getCenter(),
        });
}

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
        drivingDistance  = element.duration.text;
  
      }
    }
    return drivingDistance;
  }
}

// search for other locations
$("#location-search").click(function(){
  codeAddress();
});
  

// search for results
$("#final-search").click(function(){
var newCenter = map.getCenter();
lat = newCenter.lat();
long = newCenter.lng();

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




