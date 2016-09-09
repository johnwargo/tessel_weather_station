"use strict";

function updatePage() {
  updateWeatherData();
  updateForecast();
}

function updateWeatherData() {
  // Create a new XHR for communicating requests to the Tessel device
  var req = new XMLHttpRequest();
  req.open('GET', '/get_data');
  // Once the request gets a successful response, update the user.
  req.onload = function (e) {
    if (req.readyState == 4 && req.status == 200) {
      // Update the main page with weather data

    } else {
      // If something went wrong, log that event to the console.
      var msg = "Unable to retrieve weather data";
      console.error(msg);
      console.error(e);
      swal('Error', msg, 'error')
    }
  }
  // Send our request to the server
  req.send();
}

function updateForecast(key, zip) {
  // todo: grab configuration options from config.js

  var errorStr;
  console.log("Entering updateForecast");
  if (zip) {
    if (key) {
      var forecast_url = "http://api.wunderground.com/api/" + key + "/forecast/q/" + zip + ".json";
      console.log("Connecting to Weather Underground\nURL: %s", forecast_url);
      $.getJSON(forecast_url, function () {
        console.log("Successfully sent request, waiting for response...");
      })
        .done(function (data) {
          console.log("Processing forecast results");
          // Get just the forecast array from the returned JSON object
          var results = data.forecast.txt_forecast.forecastday;
          // Write the results to the console for troubleshooting purposes
          // console.dir(results);
          // Update the page with this data, start with the table definition
          var resHTML = '<table class="table table-striped"><tbody>';
          // next, generate rows for each forecast item
          results.forEach(function (item) {
            resHTML += '<tr><td style="width:100px"><img src="' + item.icon_url + '"></td><td><strong>' + item.title + '</strong>: ' + item.fcttext + '</td></tr>';
          });
          // finally finish off the table definition
          resHTML += '</tbody></table>';
          // and update the page with the content
          $('#ForecastContent').html(resHTML)
        })
        .fail(function () {
          showError("Unable to retrieve forecast", true);
        });
    } else {
      showError("Weather Underground Key value is not populated", true);
    }
  } else {
    showError("Zip Code is missing from the app's configuration.", true);
  }
  console.log("Leaving updateForecast")
}

function showError(errorStr, hideForecast) {
  console.error(errorStr);
  // Hide the forecast section
  if (hideForecast) {
    $('#forecast').hide();
  }
  // Display an alert dialog
  swal({
    title: alertTitle,
    text: errorStr,
    type: "error"
  });
}