'use strict';

const zwaveParser = require('./lib/zwaveparser.js');
const serialPort = require("serialport").SerialPort;

var serial = new serialPort("/dev/ttyUSB0", { baudrate : 115200 },
  function onSerialCallback(error) {
    if(error)
      console.log("INIT ERROR: " + error.message + "\n");
  });

serial.on('open', function onSerialOpen(error) {
  if(error)
    return console.error(error);

  console.log("Serial port open");

  var parser = zwaveParser.getInstance(serial);

  parser.on('message', function(message) {
    console.log("Rx Message");
  });
});

serial.on('error', function onSerialError(error) {
  console.log("ERROR: " + error.message + "\n");
});