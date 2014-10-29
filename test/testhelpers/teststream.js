'use strict';

const events = require('events');
const util = require('util');

function TestStream () {
  this.close = function() {
    return;
  };

  this.open = function() {
    return;
  };

  this.write = function(txData_, callback_) {
    return;
  }

  this.on = function() {
    return;
  }


}

util.inherits(TestStream, events.EventEmitter);

//Expose module methods
exports.TestStream = TestStream;
exports.getInstance = function() {
  return new TestStream();
}
