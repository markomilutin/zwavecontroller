'use strict'

const util = require('util');
const zutils = require('../zwaveutil.js');
const baseMessage = require('./basemessage.js');

/* This is an ACK zwave message object which inherits from the
 * BaseMessage object. Since the format of an ACK is simpler than other messages
 * all prototypes are overriden
 */

/* ACK constructor.
 *
 * Parameters:
 *
 * Return: None
 */
const ACK =
  function ACK() {
    baseMessage.BaseMessage.call(this, null, 0);

    this.mType = null;
    this.mFunctionID = zutils.ACK;
    this.mValid = true;
  }

util.inherits(ACK, baseMessage.BaseMessage);

//---------------------------------------------------------------------------------------
/* Does nothing as an ACK has no data
 * Parameters:
 *
 * Return: true
 */
ACK.prototype.setData = function(messageInfo_) {
  return true;
}

//---------------------------------------------------------------------------------------
/* Generate message Buffer for ACK message
 *
 * Parameters:
 *
 * Return: ACK raw message Buffer
 */
ACK.prototype.generateMessageBuffer = function() {
  //Create raw buffer
  var messageBuffer = new Buffer(1);

  //Populate buffer
  messageBuffer[0] = zutils.ACK;

  return messageBuffer;
}

//----------------- Private functions ----------------------------------------------------


//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//Expose module methods
exports.ACK = ACK;
exports.getInstance = function() {
  return new ACK();
}

//Expose methods for testing. This should only be used for testing functions, never in real code
exports.testingPrivate = {
}