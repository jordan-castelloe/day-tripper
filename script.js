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
  location= {center:new google.maps.LatLng(lat, long), zoom : 12};
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById("googleMap"),location);
};


//geolocate an address, convert to LatLng
function codeAddress() {
    var address = $("#choose-location").val();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        otherLocation = results[0];
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };


function findCoordinates(lat, lang, radius){
    console.log(lat);
    console.log(lang);
    console.log(radius);
    
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
  console.log(points[i])
service.nearbySearch({
    location: points[i],
    radius: '1000',
  }, callback);
}
}


// if the search works, make markers for all the results
function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      console.log(results[i]);
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






// search for other locations
$("#location-search").click(function(){
  codeAddress();
});
  

// search for results
$("#final-search").click(function(){

//set up starting location variable
if ($("another-location").is(":checked")){
  codeAddress();
};

//set up radius variable

radius = $("#distance").val();
if (radius == null){
  alert("Please choose a radius for your search!");
}; 

findCoordinates(lat, long, radius);
search();

});


});

 

/*





distance matrix key: AIzaSyDqK69kPXCV6qA1SA3RxvlHIx45CK73Rws


var origin1 = new google.maps.LatLng(55.930385, -3.118425);
var origin2 = 'Greenwich, England';
var destinationA = 'Stockholm, Sweden';
var destinationB = new google.maps.LatLng(50.087692, 14.421150);

var service = new google.maps.DistanceMatrixService();
service.getDistanceMatrix(
  {
    origins: [origin1, origin2],
    destinations: [destinationA, destinationB],
    travelMode: 'DRIVING',
    transitOptions: TransitOptions,
    drivingOptions: DrivingOptions,
    unitSystem: UnitSystem,
    avoidHighways: Boolean,
    avoidTolls: Boolean,
  }, callback);

function callback(response, status) {
  // See Parsing the Results for
  // the basics of a callback function.
}

function callback(response, status) {
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
  }
}




*/





