'use strict'

const util = require('util');
const zutils = require('../zwaveutil.js');
const baseMessage = require('./basemessage.js');

/* This is an NACK zwave message object which inherits from the
 * BaseMessage object. Since the format of an NACK is simpler than other messages
 * all prototypes are overriden
 */

/* NACK constructor.
 *
 * Parameters:
 *
 * Return: None
 */
const NACK =
  function NACK() {
    baseMessage.BaseMessage.call(this, null, 0);

    this.mType = null;
    this.mFunctionID = zutils.NACK;
    this.mValid = true;
  }

util.inherits(NACK, baseMessage.BaseMessage);

//---------------------------------------------------------------------------------------
/* Does nothing as an NACK has no data
 * Parameters:
 *
 * Return: true
 */
NACK.prototype.setData = function(messageInfo_) {
  return true;
}

//---------------------------------------------------------------------------------------
/* Generate message Buffer for NACK message
 *
 * Parameters:
 *
 * Return: NACK raw message Buffer
 */
NACK.prototype.generateMessageBuffer = function() {
  //Create raw buffer
  var messageBuffer = new Buffer(1);

  //Populate buffer
  messageBuffer[0] = zutils.NACK;

  return messageBuffer;
}

//----------------- Private functions ----------------------------------------------------


//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//Expose module methods
exports.NACK = NACK;
exports.getInstance = function() {
  return new NACK();
}

//Expose methods for testing. This should only be used for testing functions, never in real code
exports.testingPrivate = {
}