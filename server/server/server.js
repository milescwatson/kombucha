/*jshint node:true */
/*global require */
'use strict';

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    port = 80,
    data = require('./data.json'),
    fs = require('fs'),
    pollSensors = require('../../dal/pollSensors.js'),
    evalSetpoints = require('../../automation/checkSetpoints.js');

app.use(bodyParser.json());

// app.use(express.static(__dirname + '../frontend/build'));

var updateData = function(request, response){
  try {
    fs.writeFileSync('./data.json', JSON.stringify(request.body))
  } catch (e) {
    console.log('error writing file: ', e);
  }
  response.send('1');
}

var getData = function(request, response){
  response.send(fs.readFileSync('./data.json'));
}

app.post('/update-data', updateData)

app.get('/get-data', getData);

app.use(express.static(__dirname + '/../build'));

app.listen(port, function() {
  console.log('listening on port ', port, '!');
});
