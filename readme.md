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
Copy the project's source code to a folder on your development system. Configure Weather Underground settings:

	## Weather Underground Settings

Next, open a terminal window and navigate to the folder where you copied the files.

Connect the Tessel to your development system using a USB cable and test the server process using the following command:

	t2 run server.js 

The application should load and display the following output:

	INFO Looking for your Tessel...
	POPULATE WITH ACTUAL OUTPUT	

**Note:** *In this example, I'd renamed my Tessel device to 'tessel-ws' (for 'Tessel Weather Station'), your output will properly reflect the name of your Tessel device, not mine.* 

Testing
---------------------
At this point, you can open your browser of choice and navigate to the URL provided in the listed output (http://192.168.1.168:8080 in this example) to access the web application included with this project (shown below).

![Tessel Weather Station Web Application](http://johnwargo.com/files/tessel-weather_station-web-app-640.png)

You can also check that the data has been uploaded to Weather Underground using the station URL Weather Underground provides.  

Deployment
---------------------
So far, the server app is just executing on the Tessel board when you need it to, for production use, you'll need to deploy the app (and it's associated file(s)) to the device. To deploy the project's files to the device, use the same terminal window and issue the following command:

	t2 push server.js  

This command will save the server.js and index.html files to the device and configure it so it executes server.js every time you power on the Tessel device.

Known Issues
---------------------
On startup, the Tessel board will automatically attempt a connection to the last Wi-Fi access point it used. Unfortunately, if it cannot connect to that access point, it will not try again. So, if the device isn't working as expected, and you think it's the network connection, you'll need to remove power from the Tessel board then reconnect it to let it try the Wi-Fi connection again.

The device's IP address is assigned by your network router; if you replace your router, or get a new ISP, the network settings on the device may change. If this happens, or if you suspect this has happend, you'll need to use the `T2 run server.js` command to execute the server.js command interactively to see what IP address the device is using then change your browser shortcut accordingly.  

Revision History
---------------------
None yet!

***

You can find information on many different topics on my [personal blog](http://www.johnwargo.com). Learn about all of my publications at [John Wargo Books](http://www.johnwargobooks.com). 
