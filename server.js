"use strict";

/**********************************************************
 * Tessel Weather Station
 *
 * by John M. Wargo
 * www.johnwargo.com
 *
 **********************************************************/
// use the blue LED when showing activity, change to 2 for green LED
const ACTIVITY_LED = 3;
//Change MODULE_PORT to B id your temperature module is plugged into the Tessel's port B
const MODULE_PORT = 'A';
const MEASUREMENT_INTERVAL = 15; //minutes
// Weather Underground constants
const WU_URL = 'http://weatherstation.wunderground.com/weatherstation/updateweatherstation.php';
// todo: Move these to an external file for account protection
const WU_STATION_ID = 'KNCCHARL225';
const WU_STATION_KEY = 'I4UL3GPT';

// Import the interface to Tessel hardware
var tessel = require('tessel');
var climate = climatelib.use(tessel.port[MODULE_PORT]);
// Load the http module to create an http server.
var http = require('http');
var fs = require('fs');
var os = require('os');
var path = require('path');
var url = require('url');

// variables used to store last measurements for web app access
var lastData = {};
//populate the lastData object
lastData.temp = 0;
lastData.humidity = 0;
lastData.timeStamp = Date.now();

//Turn off the Activity LED, just in case it's already on
tessel.led[ACTIVITY_LED].off();

// Initialize the web server
var server = http.createServer(function (request, response) {
  // Break up the request url into easier-to-use parts
  var urlParts = url.parse(request.url, true);
  //is the request /get_data? then return the last measurements object
  if (urlParts.path == '/get_data') {
    console.log('Processing get_data request');
    //Write the JSON header to the response
    response.writeHead(200, {"Content-Type": "application/json"});
    //Then send the lastData object with the response
    response.end(lastData);
  } else {
    console.log('Serving resource request');
    //some of this code 'borrowed' from http://stackoverflow.com/questions/7268033/basic-static-file-server-in-nodejs
    // Serve whatever file the requester needs, otherwise return an error
    var reqPath = urlParts.path;
    console.log('Path: %s', reqPath);
    //Was the root of the server app requested? Then serve the index.html file
    reqPath = (reqPath == '/') ? 'index.html' : reqPath;
    console.log('Request path: %s', reqPath);
    // if (reqPath == '/') {
    //   reqPath = 'index.html';
    // }
    // get a path pointing to the requested file
    var filePath = path.join(__dirname, reqPath);
    console.log('File path: %s', filePath);
    //Does the requested file exist?
    path.exists(filePath, function (exists) {
      if (exists) {
        //Then serve the file
        console.log("Serving %s", reqPath);
        //We have the file, so go get it
        var mimeType = mimeTypes[path.extname(filePath).split(".")[1]];
        console.log('MIME type: %s', mimeType);
        response.writeHead(200, {'Content-Type': mimeType});
        //Read the file
        var fileStream = fs.createReadStream(filePath);
        //and pipe it into the response object
        fileStream.pipe(response);
      } else {
        console.warn("File '%s' does not exist", filePath);
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('404: Resource not found\n');
        response.write('Request path: ' + filePath);
        response.end();
        //todo: do I need a return here?
      }
    }); //end path.exists
  }
});

//Setup the server port we'll be listening on
//Change this to a more 'interesting' port number to fool hackers trying to get in
server.listen(8080);

//Log the IP address we're listening on
var ipAddr = os.networkInterfaces().wlan0[0].address;
console.log('Server running at http://' + ipAddr + ':8080/');

climate.on('ready', function () {
  console.log('Connected to climate module');
  // Loop forever
  setImmediate(function loop() {
    //Turn on the activity LED
    tessel.led[ACTIVITY_LED].on();
    climate.readTemperature('f', function (err, temp) {
      //Store the result for access elsewhere
      lastData.temp = temp;
      lastData.timeStamp = Date.now();
      climate.readHumidity(function (err, humid) {
        //Store the result for access elsewhere
        lastData.humidity = humid;
        //Turn off the activity LED
        tessel.led[ACTIVITY_LED].off();
        //Write the results to the console
        console.log('Degrees:', temp.toFixed(4) + 'F', 'Humidity:', humid.toFixed(4) + '%RH');
        setTimeout(loop, 1000);
      });
    });
  });
});

function sleep(time) {
  // Simple sleep function with promise
  // 'borrowed' from http://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
  return new Promise((resolve) = > setTimeout(resolve, time)
)
  ;
}
