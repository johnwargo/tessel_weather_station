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
const UPLOAD_INTERVAL = 10; //minute(s)
// Weather Underground constants
const WU_URL = 'http://weatherstation.wunderground.com/weatherstation/updateweatherstation.php?';

const mimeTypes = {
  "html": "text/html",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png",
  "js": "text/javascript",
  "css": "text/css"
};

//===============================================
// Project-specific requires
//===============================================
//Load the server's external configuration file
const Config = require('./config.js');
// Import the Tessel hardware library
const tessel = require('tessel');
//load the Tessel climate module library
const climatelib = require('climate-si7020');
const climate = climatelib.use(tessel.port[MODULE_PORT]);
//Other node modules used by this app
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const querystring = require('querystring');
const url = require('url');

// variables used to store last measurements for web app access
var lastData = {};
//populate the lastData object
lastData.temp = 0;
lastData.humidity = 0;
lastData.timestamp = new Date().toString();

//Turn off the Activity LED, just in case it's already on for some reason
tessel.led[ACTIVITY_LED].off();

//Do we have the Weather Underground configuration values we need?
if (Config.WU_STATION_ID === '' || Config.WU_STATION_KEY === '') {
  //Tell the user
  console.error('\nSTOP: Missing Weather Underground configuration values\n');
  //get out of here
  process.exit(1);
}

// Initialize the web server
var server = http.createServer(function (request, response) {
  // Break up the request url into easier-to-use parts
  var urlParts = url.parse(request.url, true);
  //is the request /get_data? then return the last measurements object
  if (urlParts.path == '/get_data') {
    console.log('Processing /get_data request');
    //Write the JSON header to the response
    response.writeHead(200, {"Content-Type": "application/json"});
    //Then send the lastData object with the response
    response.end(JSON.stringify(lastData));
  } else {
    //some of this code 'borrowed' from http://stackoverflow.com/questions/7268033/basic-static-file-server-in-nodejs
    // Serve whatever file the requester needs, otherwise return an error
    var reqPath = urlParts.path;
    //Was the root of the server app requested? Then serve the index.html file
    reqPath = (reqPath == '/') ? '/index.html' : reqPath;
    // get a path pointing to the requested file
    var filePath = path.join(__dirname, reqPath);
    //console.log('File path: %s', reqPath);
    //Does the requested file exist?
    fs.exists(filePath, function (exists) {
      if (exists) {
        //Then serve the file
        console.log("Serving %s", reqPath);
        //We have the file, so go get it
        var mimeType = mimeTypes[path.extname(reqPath).split(".")[1]];
        //console.log('MIME type: %s', mimeType);
        response.writeHead(200, {'Content-Type': mimeType});
        //Read the file
        var fileStream = fs.createReadStream(filePath);
        //and pipe it into the response object
        fileStream.pipe(response);
      } else {
        console.warn("File '%s' does not exist", reqPath);
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('404: Resource not found\n');
        response.write('Request path: ' + reqPath);
        response.end();
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

//=========================================================
//Now start working on climate data collection and upload
//=========================================================
climate.on('ready', function () {
  console.log('\nConnected to climate module');

  //get current minute minus 1
  var lastMin = new Date().getMinutes() - 1;
  // if less than 0, set to 59. This forces a measurement to be taken at the start every time
  lastMin = (lastMin < 0) ? 59 : lastMin;
  console.log('Last minute: %s\n', lastMin);

  // Loop forever
  setImmediate(function loop() {
    var currentMin = new Date().getMinutes();
    //has the minute changed? We'll take a measurement every minute
    if (currentMin != lastMin) {
      //Reset out lastMin variable
      lastMin = currentMin;
      //Turn on the activity LED
      tessel.led[ACTIVITY_LED].on();
      //Read the temperature from the climate module
      climate.readTemperature('f', function (err, temp) {
        //Store the result for access elsewhere
        lastData.temp = parseFloat(temp.toFixed(1));
        //get the timestamp
        lastData.timestamp = new Date().toString();
        console.log(lastData.timestamp);
        //Now read the humidity
        climate.readHumidity(function (err, humid) {
          //Store the result for access elsewhere
          lastData.humidity = parseFloat(humid.toFixed(1));
          //Turn off the activity LED
          tessel.led[ACTIVITY_LED].off();
          //Write the results to the console
          console.log('Degrees:', temp.toFixed(1) + ' F', 'Humidity:', humid.toFixed(1) + '% RH');
          //Is it time to upload?
          if (currentMin < 1 || currentMin % UPLOAD_INTERVAL == 0) {
            //should we be uploading data to Weather Underground?
            if (Config.WU_UPLOAD) {
              //upload the data to Weather Underground
              //Build our data 'package'
              var wuData = {
                "action": "updateraw",
                "ID": Config.WU_STATION_ID,
                "PASSWORD": Config.WU_STATION_KEY,
                "dateutc": "now",
                "humidity": humid,
                "tempf": temp
              }
              //Convert the object into URL format
              var dataPath = querystring.stringify(wuData);
              // console.log(dataPath);
              console.log('Sending data to Weather Underground');
              http.get(WU_URL + dataPath, function (res) {
                // body will contain the final response
                var body = '';
                // Received data is a buffer, adding it to our body
                res.on('data', function (data) {
                  body += data;
                });
                // After a full response, log it to the console
                res.on('end', function () {
                  console.log('Upload completed: %s', body);
                });
              })
              // If we have an error, log error to console
                .on('error', function (e) {
                  console.error("Error: " + e.message);
                });
            }
          }
        });
      });
    }
    // do it again in 1 second
    setTimeout(loop, 1000);
  });
});

