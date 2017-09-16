$(document).ready(function(){

var geocoder;
var map;
var infowindow;
var location;
var myLocation;
var otherLocation;
var lat;
var long;
var newLat;
var newLang;
var radius;
var distance;
var LatLng;
var points = [];
var numberOfPoints = 20;



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
        otherLocation = results[0];
        lat = otherLocation.latitude;
        long = otherLocation.longitude;
        map.setCenter(results[0].geometry.location);
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
      newLang = lang + y2;
      LatLng = new google.maps.LatLng({lat: newLat, lng: newLang}); 
    // save to our results array
      points.push(LatLng);

        // Shift our angle around for the next point
    currentAngle += degreesPerPoint;
    };
};


//do a nearby search. We'll end up doing this for points generated with the findCoordiantes function
function search(){
service = new google.maps.places.PlacesService(map);
for (var i = 0; i < numberOfPoints; i++){
    service.nearbySearch({
    location: points[i],
    radius: '5000',
  }, searchCallback);
  getDistance(points[i]);
}
}


// if the search works, make markers for all the results
function searchCallback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}


//make a marker that shows the place name when you click on it
function createMarker(place) {
    var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });

    infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
        });
      };


function getDistance(destination){
var origin = new google.maps.LatLng({lat: lat, lng: long});
console.log(origin);
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
        console.log(duration);
      }
    }
  }
}



// search for other locations
$("#location-search").click(function(){
  codeAddress();
});
  

// search for results
$("#final-search").click(function(){

//set up starting location variable
if ($("another-location").is(":checked")){
  codeAddress();
  location = otherLocation;
} else {
  location = myLocation;
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

 













