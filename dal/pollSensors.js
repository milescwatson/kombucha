/*
 * This will be started by server.js
 * [] create periodic job to pull sensor values 
 * check enabled channels (frontend/server/data.json)
 */

var Influx = require('influx'),
    os = require('os'),
    util = require('util'),
    exec = util.promisify(require('child_process').exec),
    fs = require('fs'),
    m = require('@milescwatson/m'),
    fetch = require('node-fetch'),
    periodicTask = require('periodic-task'),
    runEveryMinute = new periodicTask(30000, function(){
    	console.log('polling sensors')
	pollSensors()
    });

var pollSensors = async function(){
	var sensorValues = [];
	
	var relaySetpoints = []; // setpoints by relay
	var data = fs.readFileSync('/home/pi/kombucha/server/server/data.json');
	
	for(relay in data.relays){
		relaySetpoints.push(data.relays[relay].setpoint);
	}

	for(var i = 0; i < 8; i++){
  		const { stdout, stderr } = await exec(`python3 /home/pi/kombucha/dal/getF.py ${i}`)
		sensorValues.push(parseFloat(stdout).toFixed(2));
	}
	
	var requestBody = {
		tags: {'host': os.hostname(), 'brewer': 'b1'},
		fields: {
			0: sensorValues[0],
			1: sensorValues[1],
			2: sensorValues[2],
			3: sensorValues[3],
			4: sensorValues[4],
			5: sensorValues[5],
			6: sensorValues[6],
			7: sensorValues[7]
		}

	}

	m.fetch.postJSON('http://milescwatson.com:4000/influx-sensor-data', requestBody, function(error, result){
		if(!error){
			console.log('Sensor data sent successfully')
		}
		else{
		console.log('error sending temp values: ', error)
		}
	})

}
runEveryMinute.run()
