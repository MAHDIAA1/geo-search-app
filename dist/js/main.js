

/*
  A FUNCTION CALLED GEOCOGING() IS TO SEARCH OF PLACE OF INTEREST
  A FUNCTION CALLED WEATHER() IS TO SEARCH FOR WEATHER CONDITION OF A PLACE
  A FUNCTIO CALLED CREATEMAP() IS TO DISPLAY A PLACE OF INTEREST TO THE MAP
*/


// GEOLOCATION SECTION

const searchInput = document.getElementById('search');
const geoBtn = document.getElementById('geo-btn');

let geoRequest = new XMLHttpRequest();

function geocode() {
  if (searchInput.value) {
    let location = searchInput.value;
    geoRequest.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=AIzaSyAA9LyqsrsQx-h9GRUarkLd6TzwS-OkeJE');
    geoRequest.send();
  }

}

geoRequest.onreadystatechange = () => {
  if (geoRequest.readyState === 4) {
    if (geoRequest.status === 404) {
      document.getElementById('report-section').style.display = 'block';
      return document.getElementById('report-section').textContent = 'City Not Found';
    } else {
      document.getElementById('report-section').style.display = 'none';
    }

    let response = JSON.parse(geoRequest.response);

    let addressComponents = response.results[0].address_components;
      let addressComponentsOutput = '<ul class="list-group">';
      for(let i = 0; i < addressComponents.length; i++){
        addressComponentsOutput += `
          <li class="list-group-item"><strong>${addressComponents[i].types[0]}</strong>: ${addressComponents[i].long_name}</li>
        `;
      }

    addressComponentsOutput += '</ul>';
    document.getElementById('address-component').innerHTML = addressComponentsOutput;
    let lat = response.results[0].geometry.location.lat;
    let lng = response.results[0].geometry.location.lng;

    let geometryOutput = `
    <ul class="list-group">
      <li class="list-group-item"><strong>Latitude:</strong> ${lat}</li>
      <li class="list-group-item"><strong>longitude:</strong> ${lng}</li>
    </ul>
  `;
   document.getElementById('geocode').innerHTML = geometryOutput;
  }
};

// WEATHER SECTION
  let weatherRequest = new XMLHttpRequest();
  function weather() {
    let location = searchInput.value;
    weatherRequest.open('GET', 'https://api.openweathermap.org/data/2.5/weather?q='+ location +'&appid=9350f68cecab6c5736fc89682515db47');
    weatherRequest.send();
  }

  weatherRequest.onreadystatechange = () => {
    if (weatherRequest.readyState === 4) {
        if (weatherRequest.status === 404) {
          document.getElementById('report-section-weather').style.display = 'block';
          return document.getElementById('report-section-weather').textContent = 'City Not Found for weather Report';
        } else {
          document.getElementById('report-section-weather').style.display = 'none';
        }

        let response = JSON.parse(weatherRequest.response);
        let weatherReportTemp = response.main.temp;
        let weatherReportHum = response.main.humidity;
        let weatherReportPre = response.main.pressure;
        let weatherLocationName = response.name;
        let weatherReport = response.weather[0].main;

        // TEMPERATURE CONVERSION  
        let weatherReportCelcius = Math.round(weatherReportTemp - 273.15);
        let ferin = Math.round((weatherReportCelcius * 9/5) + 32);
        let celcius = Math.round((ferin - 32) * 5/9);

        // WEATHER OUTPUT
        let weatherOutput = `
          <ul class="list-group">
            <li class="list-group-item">
              <span class="temp-report">
                <span class="temp-show" id="celc">Temperature: ${weatherReportCelcius}&#8451;</span>
                <span class="temp-hide" id="ferin">Temperature: ${ferin}&#8457;</span>
                <span id="ferin-btn"><button class="btn-temp">See in &#8457;</button></span>
              </span>
            </li>
            <li class="list-group-item"><strong>Humidity:</strong> ${weatherReportHum}g/m<sup>3</sup></li>
            <li class="list-group-item"><strong>Pressure:</strong> ${weatherReportPre}mmHg</li>
            <li class="list-group-item"><strong>The Weather is</strong> ${weatherReport}</li>
          </ul>
        `;
       
          document.getElementById('weather-report').innerHTML = weatherOutput;
          document.getElementById('ferin-btn').addEventListener('click', toggleTemperature);
          function toggleTemperature() {
              document.getElementById('celc').style.display = 'none';
              document.getElementById('ferin').style.display = 'block';                                    
          }

      }
    }


// CHECK MY CURRENT LOCATION AND OTHER LOCATIONS

let map, infoWindow;

function createMap () {

  // Declaring The MAp
  let options = {
    center: { lat: 9.0765, lng: 7.3986 },
    zoom: 9
  };

  map = new google.maps.Map(document.getElementById('map'), options);

  // Getting your current Location
  infoWindow = new google.maps.InfoWindow;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (p) {
      let position = {
        lat: p.coords.latitude,
        lng: p.coords.longitude
      };

      let latValue = p.coords.latitude;
      let lngValue = p.coords.longitude;

      let geometryOutput = `
        <ul class="list-group">
          <li class="list-group-item">Latitude: ${latValue}</li>
          <li class="list-group-item">longitude: ${lngValue}</li>
        </ul>
      `;

      document.getElementById('geocode').innerHTML = geometryOutput;

      infoWindow.setPosition(position);
      infoWindow.setContent('Your location!');
      infoWindow.open(map);
      map.setCenter(position);
    }, function () {
      handleLocationError('Geolocation service failed', map.getCenter());
    });
  } else {
    handleLocationError('No geolocation available.', map.getCenter());
  }

  // SEARCH FOR PLACE OF CHOICE
  let input = document.getElementById('search');
  let searchBox = new google.maps.places.SearchBox(input);

  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];
  
  searchBox.addListener('places_changed', function () {
    let places = searchBox.getPlaces();
    if (places.length == 0){
      return;
    }

    markers.forEach(function (m) { 
      m.setMap(null); 
    });
    markers = [];

    let bounds = new google.maps.LatLngBounds();
    places.forEach(function(p) {
      if (!p.geometry)
        return;

      markers.push(new google.maps.Marker({
        map: map,
        title: p.name,
        position: p.geometry.location
      }));

      if (p.geometry.viewport){
        bounds.union(p.geometry.viewport);
      }
      else{
        bounds.extend(p.geometry.location);
      }
    });
    
    map.fitBounds(bounds);
  });
}

// Location function
function handleLocationError (content, position) {
  infoWindow.setPosition(position);
  infoWindow.setContent(content);
  infoWindow.open(map);
}
