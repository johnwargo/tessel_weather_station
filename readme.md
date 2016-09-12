Tessel Weather Station
======================
By [John M. Wargo](www.johnwargo.com)

Introduction
---------------------
This project is a simple weather station built using the [Tessel 2](https://tessel.io/) development platform and a [Tessel climate module](https://tessel.io/modules#module-climate). The Tessel development board runs a simple web server application that: 

+ Periodically measures temperature and humidity from the climate module
+ Uploads weather data to Weather Underground for your own personal Weather Underground station
+ Serves a simple web page (shown in the figure below) to display current measurements

Components
---------------------
To build this project, you'll need the following:

+ [Tessel 2 development board](https://tessel.io/)
+ [Tessel Climate module](https://tessel.io/modules#module-climate)
+ [5V, Micro USB power supply](https://www.adafruit.com/products/1995) 

**Note:** *The development board is available in the US from Sparkfun, but they don't carry the relay module, so I ordered both from Seeed Studio (China).*

Weather Underground Account Setup
---------------------------------

Weather Underground (WU) is a public weather service now owned by the Weather Channel; it's most well known for enabling everyday people to setup weather stations and upload local weather data into the WU weatherbase for public consumption.

For this project, I used two services from Weather Underground:

+ Weather Station - Used to upload weather data into the WU weatherbase. Point your browser of choice to [https://www.wunderground.com/weather/api/](https://www.wunderground.com/weather/api/) to setup your weather station. Once you complete the setup, WU will generate a station ID and access key you'll need to access the service from the project. Be sure to capture those values, you'll need them later.
+ Weather API - Used to retrieve weather forecast data from WU. Point your browser of choice to [https://www.wunderground.com/personal-weather-station/signup.asp](https://www.wunderground.com/personal-weather-station/signup.asp) to sign up to use their API. Once you complete the setup, WU will generate a secret key and access key you'll need to access the service from the project. Be sure to capture those values, you'll need them later. 

Hardware Setup
---------------------
Follow the instructions on the [Tessel web site](http://tessel.github.io/t2-start/) to setup your development system and connect the Tessel board. Be sure to update the Tessel board's firmware to the latest version and connect the device to your Wi-Fi network. Next, disconnect the USB cable from the Tessel board then attach the relay module to the Tessel's module A port.

Install the climate module's software library using the following command:

	npm install climate-si7020

Software Installation
-------------------- 
Copy the project's source code to a folder on your development system. Within the project are two configuration files that will need to be updated for the application to run correctly:

+ `config.js` - The configuration file for the server application.
+ `/js/config.js` - The configuration file for the client-side application.

To configure the server application, open the project folder's `config.js` file, you'll find the following content in the file:

	const Config = {
		WU_UPLOAD: true,
	    WU_STATION_ID: '',
	    WU_STATION_KEY: ''
	} 

The `WU_UPLOAD` property controls whether the server application uploads data to Weather Underground. Change `WU_UPLOAD` from `true` to `false` to disable this feature. Populate the `WU_STATION_ID` and `WU_STATION_KEY` values with the Station ID and Station Key values you created when you created your own Weather Underground weather station earlier in the installation process. Save your changes to this file before continuing.

The `server.js` sports some less-frequently changed configuration options. If you look at the top of the file, you'll see the following code: 

	// use the blue LED when showing activity, change to 2 for green LED
	const ACTIVITY_LED = 3;
	//Change MODULE_PORT to B id your temperature module is plugged into the Tessel's port B
	const MODULE_PORT = 'A';
	const UPLOAD_INTERVAL = 10; //minute(s)

If you want to blink the Green user LED instead of the blue one when measurements are taken, change `ACTIVITY_LED` from `3` to `2`. By default, the code expects the climate module to be plugged into the primary module connector (A), if you have something else in that port and want to use port B, change `MODULE_PORT` from `A` to `B`. Finally, if the server's `config.js` file is configured with `WU_UPLOAD` set to true, the server app will upload data to Weather Underground every `UPLOAD_INTERVAL` minutes, if you want to change how frequently data is uploaded, change the integer value associated with this constant. Save your changes to this file before continuing.

The client-side web application's behavior is controlled by the contents of the project's `/js/config.js` file. Open the file in a text editor, and you'll find the following contents:

	const Config = {
	    GET_FORECAST: true,
	    SHOW_GAUGES: true,
	    WU_API_KEY: '',
	    ZIP_CODE: '44313'
	}

You can control whether the client-side web application displays temperature and humidity gauges by setting `SHOW_GAUGES` to `true` or `false`. You can also control whether the local forecast is displayed in the client-side web application by setting `GET_FORECAST` to `true` or `false`. When `GET_FORECAST` is `true`, you'll also need to populate the file with a value for the `ZIP_CODE` and `WU_API_KEY` properties. The `WU_API_KEY` value is the value you generated when you registered for Weather Underground API access earlier in the installation process. Save your changes to this file before continuing.

Next, open a terminal window and navigate to the folder where you copied the files. Connect the Tessel to your development system using a USB cable and test the server process using the following command:

	t2 run server.js 

The application should load and display the following output:

	INFO Looking for your Tessel...
	INFO Connected to tessel-ws.
	INFO Building project.
	INFO Writing project to RAM on tessel-ws (159.232 kB)...
	INFO Deployed.
	INFO Running server.js...
	Server running at http://192.168.1.51:8080/
	Connected to climate module
	Degrees: 84.2 F Humidity: 39.3% RH

**Note:** *In this example, I'd renamed my Tessel device to 'tessel-ws' (for 'Tessel Weather Station'), your output will properly reflect the name of your Tessel device, not mine.* 

Testing
---------------------
At this point, you can open your browser of choice and navigate to the URL provided in the listed output (http://192.168.1.51:8080 in this example) to access the web application included with this project (shown below).

![Tessel Weather Station Web Application](http://johnwargo.com/files/tessel-weather_station-web-app-640.png)

You can also check that the data has been uploaded to Weather Underground using the station URL Weather Underground provides.

Deployment
---------------------
So far, the server app is just executing on the Tessel board when you need it to, for production use, you'll need to deploy the app (and it's associated file(s)) to the device. To deploy the project's files to the device, use the same terminal window and issue the following command:

	t2 push server.js  

This command will save the server.js and index.html files to the device and configure it so it executes server.js every time you power on the Tessel device. At this point, you can disconnect the Tessel board from your development computer and operate it directly from a USB power source.

Known Issues
---------------------
On startup, the Tessel board will automatically attempt a connection to the last Wi-Fi access point it used. Unfortunately, if it cannot connect to that access point, it will not try again. So, if the device isn't working as expected, and you think it's the network connection, you'll need to remove power from the Tessel board then reconnect it to let it try the Wi-Fi connection again.

The device's IP address is assigned by your network router; if you replace your router, or get a new ISP, the network settings on the device may change. If this happens, or if you suspect this has happend, you'll need to use the `T2 run server.js` command to execute the server.js command interactively to see what IP address the device is using then change your browser shortcut accordingly.

The Tessel doesn't have a real-time clock (RTC), so there's no guarantee that the temp upload will happen on the correct minute interval. The Tessel board's clock is set to the development system's clock when code is pushed to the device, but run running stand-alone, it might not have the right time. The board also doesn't have any concept of timezone; this is why all console output by the server application shows a UTC time instead of local time. Yes, I could make the timzeone a configuration value and calculate local time, but I didn't.

Revision History
---------------------
None yet!

***

You can find information on many different topics on my [personal blog](http://www.johnwargo.com). Learn about all of my publications at [John Wargo Books](http://www.johnwargobooks.com). 
