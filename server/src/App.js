import React, { useState, useEffect } from 'react';
import { Spinner, Form } from 'react-bootstrap';
var data = require('./data');
var m = require('@milescwatson/m');

var timerActive = false;

var dataModel = {
  sensors: {},
  relays: {}
};

var sendState = function(){
  // if timer already active, do not activate again
  if(!timerActive && (Object.keys(dataModel.sensors).length !== 0) && (Object.keys(dataModel.relays).length !==0)) {
    timerActive = true;
    setTimeout(function () {
      console.log('batch sending');
      m.fetch.postJSON('/update-data', dataModel, function(error, result){
        if(!error){
        }
      })
      timerActive = false;
    }, 3000);
  }
}

function App() {
  // const [ dataState, setDataState ] = useState(null)
  const [ relayState, setRelayState ] = useState(null)
  const [ sensorState, setSensorState ] = useState(null)

  function isReady(){
    if((relayState === null) || (sensorState === null)){
      return false;
    }else{
      return true;
    }
  }

  var getData = function(){
    m.fetch.getJSON('/get-data', function(error, result){
      if(!error){
        setRelayState(result.relays)
        setSensorState(result.sensors)
      }
    });
  }
  useEffect(getData, [])

  var sensorLiftState = function(singleSensorState, index){
    dataModel.sensors[index] = singleSensorState;
    sendState();
  }

  var relayLiftState = function(singleRelayState, index){
    dataModel.relays[index] = singleRelayState;
    sendState();
  }

  var SingleSensor = function(props){
    const [ singleSensorState, setSingleSensorState ] = useState({name: props.name, isEnabled: props.isEnabled});
    useEffect(()=>{
      props.sensorLiftState(singleSensorState, props.id)
    })

    var handleChange = function(event){
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

      if(event.target.type === 'checkbox'){
        setSingleSensorState({
          ...singleSensorState,
          isEnabled: value
        })
      }else{
        setSingleSensorState({
          ...singleSensorState,
          name: value
        })
      }

    }

    return(
      <React.Fragment>
        <div className="singleSensor">
          <p style={{"display": "inline"}} className="h4" >Sensor Channel {props.id}</p>
          Channel Name: <input className="form-control" type="text" onChange={handleChange} value={ singleSensorState.name } />
          <Form.Check
            checked={singleSensorState.isEnabled}
            onChange={handleChange}
            style={{'display':'inline'}}
            type= 'checkbox'
            id= {'isEnabled'+props.id}
            label={'Enabled'}
          />
          <br />
        </div>
      </React.Fragment>
    )
  }

  var SingleRelay = function(props){
    const [ singleRelayState, setSingleRelayState] = useState({
      "name": props.name,
      "mode": props.mode,
      "onSetpoint": props.onSetpoint,
      "setpoint": props.setpoint,
      "sensorChannel": props.sensorChannel
    });

    useEffect(()=>{
      props.relayLiftState(singleRelayState, props.id)
    })

    var handleChange = function(event){
      var value = event.target.value;
      if(event.target.type === 'select-one'){
        switch (event.target.name) {
          case 'assocSensor':
            setSingleRelayState({
              ...singleRelayState,
              sensorChannel: value
            })
            break;
          case 'operator':
            setSingleRelayState({
              ...singleRelayState,
              onSetpoint: value
            })
            break;
          case 'mode':
            setSingleRelayState({
              ...singleRelayState,
              mode: value
            })
            break;
        }
      }else{
        switch(event.target.name){
          case 'name':
            setSingleRelayState({
              ...singleRelayState,
              name: value
            })
            break;
          case 'setpoint':
            setSingleRelayState({
              ...singleRelayState,
              setpoint: value
            })
            break;
        }
      }
    }

    return(
      <React.Fragment>
        <div className="singleRelay">
          <p style={{"display": "inline"}} className="h4" >Relay Channel {props.id}</p>
          <Form.Label>
          Channel Name:
          <input className="form-control" type="text" name="name" value={singleRelayState.name} onChange={handleChange}/>
          </Form.Label>
          Mode:
          <select className="form-control" value={singleRelayState.mode} name="mode" onChange={handleChange}>
            <option value="auto">Auto</option>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>

          Positive value if the value of sensor
          <select className="form-control" value={singleRelayState.sensorChannel} name="assocSensor" onChange={handleChange}>
            {Object.keys(props.sensorChannels).map(function(key){
              return(
                <option value={key} key={key}>{`(${key}) ` +props.sensorChannels[key].name}</option>
              )
            })}
          </select>

          <Form.Label>Is
          <Form.Control value={singleRelayState.onSetpoint} as="select" name="operator" onChange={handleChange}>
            <option value={">"}> {">"} </option>
            <option value={"<"}> {"<"} </option>
          </Form.Control>
          </Form.Label>
          than
          <input className="form-control" name="setpoint" type="number" placeholder="value" value={singleRelayState.setpoint} onChange={handleChange} />
          <br />
        </div>
      </React.Fragment>
    )
  }

  if(!isReady()){
    return(
      <>
      <Spinner animation="border" variant="success" />
      </>
    )
  } else {
    return (
      <div className="App">
        <h1>Kombucha Control</h1>
        <h4>brew-01</h4>

        <h2>Relay Controls</h2>
        <div className='relays-container'>
          {(Object.keys(relayState)).map(function(key, value){
            return(
              <SingleRelay
                key= {'relay_'+key}
                id = {key}
                name = {relayState[key].name}
                mode = {relayState[key].mode}
                onSetpoint = {relayState[key].onSetpoint}
                setpoint = {relayState[key].setpoint}
                sensorChannel = {relayState[key].sensorChannel}
                sensorChannels = {sensorState}
                relayLiftState = {relayLiftState}
              />
            )
          })}
        </div>

        <h2>Sensor Controls</h2>
        <div className='sensors-container'>
          {(Object.keys(sensorState)).map(function(key, value){
            return(
              <SingleSensor
                name = {sensorState[key].name}
                isEnabled = {sensorState[key].isEnabled}
                key = {'sens_'+key}
                id = {key}
                sensorLiftState = {sensorLiftState}
              />
            )
          })}
        </div>

      </div>
    );
  }
}
export default App;
