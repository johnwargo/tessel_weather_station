"use strict";

function getWeatherData() {
    console.log('Entering getWeatherData');
    // Create a new XHR for communicating requests to the Tessel device
    var req = new XMLHttpRequest();
    req.open('GET', '/get_data');
    // Once the request gets a successful response, update the user.
    req.onload = function (e) {
        if (req.readyState == 4 && req.status == 200) {
            var res = JSON.parse(req.responseText);
            updatePage(res);
        } else {
            var msg = "Unable to retrieve weather data.";
            console.error(msg);
            console.error(e);
            swal('Error', msg, 'error');
            return {};
        }
    }
    // Send our request to the server
    req.send();
    console.log('Leaving getWeatherData');
}

function updatePage(weatherData) {
    console.log('Entering updatePage');
    //did we get any data back?
    if (weatherData) {
        console.dir(weatherData);
        updateWeatherData(weatherData);
        if (Config.SHOW_GAUGES) {
            //Draw the gauges
            renderGauges(weatherData);
        } else {
            $('#graphs').hide();
        }
        if (Config.GET_FORECAST) {
            //Grab the forecast from Weather Underground
            updateForecast(Config.WU_API_KEY, Config.ZIP_CODE);
        } else {
            $('#forecast').hide();
        }
    } else {
        // No data, hide things and move on
        $('#temp').hide();
        $('#humidity').hide();
        $('#timestamp').hide();
        //hide graphs
        $('#graphs').hide();
        //hide forecast
        $('#forecast').hide();
    }
    console.log('Leaving updatePage');
}

function updateWeatherData(weatherData) {
    console.log('Entering updateWeatherData');
    //Update the main page with weather data
    $('#temp').html(weatherData.temp);
    $('#humidity').html(weatherData.humidity);
    $('#timestamp').html(weatherData.timestamp);
    console.log('Leaving updateWeatherData');
}

function renderGauges(weatherData) {
    console.log("Entering renderGauges");
    // first do the temp gauge
    var g_temp = new JustGage({
        id: "g_temp",
        value: weatherData.temp,
        min: -20,
        max: 120,
        title: "Temperature (Deg. F)",
        customSectors: [{
            color: "#0000ff",
            lo: -20,
            hi: 55
        }, {
            color: "#ff0000",
            lo: 55,
            hi: 120
        }]
    });

    //Now humidity
    var g_humidity = new JustGage({
        id: "g_humidity",
        value: weatherData.humidity,
        min: 0,
        max: 100,
        title: "Humidity (%)",
        levelColorsGradient: true
    });
    console.log("Leaving renderGauges")
}

function updateForecast(key, zip) {
    var errorStr;
    console.log("Entering updateForecast");
    //Do we have a valid Weather Underground configuration?
    if (Config.ZIP_CODE =='' || Config.WU_API_KEY == '') {
        console.error('Missing configuration settings');
        swal({
            title: 'Configuration Error',
            text: 'Missing configuration settings',
            type: "error"
        });
        //get outta here
        return;
    }
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