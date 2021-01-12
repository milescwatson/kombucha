var fs = require('fs'),
    os = require('os'),
    util = require('util'),
    exec = util.promisify(require('child_process').exec),
    periodicTask = require('periodic-task'),
    evalSetpoints = new periodicTask(30000, function(){
	console.log('evaluate checkpoints')
    	checkSetpoints()
    });

var checkSetpoints = async function(){
    var data = JSON.parse(fs.readFileSync('/home/pi/kombucha/server/server/data.json'));
    //const  { stdout, stderr } = await exec (`python3 ../dal/controlRelays.py ${a b}`
    var relays = data.relays;

    for(rKey in relays){
	// get associated temperature value
	var channel = relays[rKey].sensorChannel;
	
	var { stdout, stderr } = await exec(`python3 /home/pi/kombucha/dal/getF.py ${channel}`)
	var value = parseFloat(stdout).toFixed(2);
	var setPoint = relays[rKey].setpoint;
	var operator = relays[rKey].onSetpoint;
	//console.log('temp value = ', value, 'setPoiunt', setPoint)
	
	// evaluate value
	var isOn = false;

	if(operator === '>'){
		// on, if temperature is greater than setpoint
		if(value > setPoint){
			isOn = true;
		}
	}else if(operator === '<'){
		// on, if temperature is less than setpoint
		if(value < setPoint){
			isOn = true;
		}
	}
	
	//switch relay
	if(isOn){
		var { stdout, stderr } = await exec(`python3 /home/pi/kombucha/dal/controlRelay.py ${rKey} ${1}`)
		//console.log(stdout, stderr)
	}else{
	
		var { stdout, stderr } = await exec(`python3 /home/pi/kombucha/dal/controlRelay.py ${rKey} ${0}`)
		//console.log(stdout, stderr)
	}

    }
    console.log('Checked relays against setpoints')
}

evalSetpoints.run();
