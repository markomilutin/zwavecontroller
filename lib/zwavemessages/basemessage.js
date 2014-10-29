'use strict'

const utils = require('../zwaveutil.js');

/* This is a base zwave message object. It will encapsulate data and
 * functions that all messages should support.
 */

/* BaseMessage constructor. If a raw buffer is provided it will be parsed
 * for base message data. Raw buffer will only be parsed if it's a 'response' message type
 *
 * Parameters:
 *
 * rawBuffer_: A buffer containing the message binary data, can be null.
 *            If not null must be a valid message. If not null ownership is taken by the object
 *
 * rawBufferSize_: Size of incoming message buffer
 *
 * Return: None
 */
const BaseMessage =
  function BaseMessage(rawBuffer_, rawBufferSize_) {
    _clear.call(this);

    if(rawBuffer_ && rawBufferSize_ > 0)
      _parseRawBuffer.call(this, rawBuffer_, rawBufferSize_);
  }

//---------------------------------------------------------------------------------------
/* Generates an association array with the message information.
 * Parameters:
 *
 * None
 *
 * Return: Return an association array with the message information
 */
BaseMessage.prototype.getData = function() {
  var messageInformation = {
    'type': this.mType,
    'functionID': this.mFunctionID,
    'data': this.mDataBuffer,
    'dataLen': this.mDataBufferLen,
    'callbackID': this.mCallbackID,
    'cs': this.mCS,
    'valid': this.mValid
  }

  return messageInformation;
}

/* Returns if the message is valid
 * Parameters:
 *
 * None
 *
 * Return: true if the message is valid otherwise false
 */
BaseMessage.prototype.messageValid = function() {
  return this.mValid;
}

//---------------------------------------------------------------------------------------
/* Takes in an association array with message information.
 * This information will used to setup the message member variables. If
 * information is missing or is invalid Error will be returned, otherwise true.
 * Checksum will be generated automatically.
 * Parameters:
 *
 * messageDescriptor: Association array with enough information to setup message object. All
 *                    unexpected fields are ignored.
 *                    Required fields:
 *                        - type -> Single byte representing type of message, REQUEST or RESPONSE
 *                        - functionID -> Single byte representing the message
 *                        - data -> Buffer contains the data portion of the message (contains callbackID)
 *                        - dataLen -> Length of the data buffer. Final message size including header, data
 *                                     and CS must be less than 256 bytes
 *
 * Return: true if message can be constructed, otherwise Error
 */
BaseMessage.prototype.setData = function(messageInfo_) {
  //'type' field is required
  if(!('type' in messageInfo_))
    return new Error('Missing type field');

  //'functionID' field is required
  if(!('functionID' in messageInfo_))
    return new Error('Missing functionID field');

  //'data' field is required
  if(!('data' in messageInfo_))
    return new Error('Missing data field');

  //'dataLen' field is required
  if(!('dataLen' in messageInfo_))
    return new Error('Missing dataLen field');

  //Verify that a message can be generated from the data passed in

  //Type must be either REQUEST or RESPONSE
  if(messageInfo_['type'] !== utils.REQUEST && messageInfo_['type'] !== utils.RESPONSE)
    return new Error('Invalid type');

  //Overall message size must be less than 256 bytes
  if((messageInfo_['dataLen'] + utils.ZWAVE_MIN_MESSAGE_SIZE) > 256)
    return new Error('Message too big');

  //Populate the member variables
  this.mType = messageInfo_['type'];
  this.mFunctionID = messageInfo_['functionID'];
  this.mDataBuffer = messageInfo_['data'];
  this.mDataBufferLen = messageInfo_['dataLen'];
  this.mValid = true;

  //Generate the CS
  var messageBuffer = this.generateMessageBuffer();

  //If we are unable to generate CS pass the error back up
  if(messageBuffer instanceof Error) {
    messageBuffer = null;
    _clear.call(this);
    return messageBuffer;
  }

  this.mCS = messageBuffer[messageBuffer.length - 1];
  messageBuffer = null;

  return true;
}

//---------------------------------------------------------------------------------------
/* Generate message Buffer from the data contained in the object.
 * Generated buffer contains a full zwave message ready for transmission (buffer size is message size).
 * An Error is raised if message cannot be generated
 * Parameters:
 *
 * Return: Buffer if a message can be generated, otherwise Error
 */
BaseMessage.prototype.generateMessageBuffer = function() {
  //Message must be valid
  if(!this.mValid)
    return new Error('Cannot generate buffer with invalid data');

  if(this.mDataBuffer === null && this.mDataBufferLen !== 0)
    return new Error('mDataBuffer null but mDataBufferLen indicates data');
  if(this.mDataBuffer !== null && this.mDataBufferLen === 0)
    return new Error('mDataBuffer not null but mDataBufferLen indicates 0');

  //Create raw buffer
  var messageBuffer = new Buffer(utils.ZWAVE_MIN_MESSAGE_SIZE + this.mDataBufferLen);

  //Populate buffer
  messageBuffer[0] = utils.SOF;
  messageBuffer[1] = this.mDataBufferLen + 3;
  messageBuffer[2] = this.mType;
  messageBuffer[3] = this.mFunctionID;

  //If there is data then copy it to the raw buffer being generated
  if(this.mDataBufferLen > 0) {
    this.mDataBuffer.copy(messageBuffer, 4, 0, this.mDataBufferLen);
  }

  var cs = utils.calcCS(messageBuffer.slice(1, messageBuffer[1] + 1), messageBuffer[1]);

  //If there was an error pass it back up
  if(cs instanceof Error)
    return cs;

  messageBuffer[utils.ZWAVE_MIN_MESSAGE_SIZE + this.mDataBufferLen - 1] = cs;

  return messageBuffer;
}

//----------------- Private functions ----------------------------------------------------

//---------------------------------------------------------------------------------------
/* Set the member variables to defaults, erasing any data stored.
 * Parameters:
 *
 * Return: None
 */
function _clear() {
  //Set default values for variables
  this.mType = utils.REQUEST;
  this.mFunctionID = utils.FUNC_ID_UNDEFINED;
  this.mDataBuffer = null;
  this.mDataBufferLen = 0;
  this.mCallbackID = utils.INVALID_CALLBACK_ID;
  this.mCS = 0;
  this.mValid = false;
  return;
}

//---------------------------------------------------------------------------------------
/* Parse the raw buffer, validate data and assign member variables. The message must be a 'Response' message
 * If message is not valid return false, otherwise true
 * Parameters:
 *
 * rawBuffer_: Buffer containing the data to be parsed
 *
 * rawBufferSize_: Size of the input buffer, expected to be at least 5 bytes
 *
 * Return: If all data is valid return true, otherwise Error
 */
function _parseRawBuffer(rawBuffer_, rawBufferSize_) {
  //Ensure minimum size is met
  if(rawBufferSize_ < utils.ZWAVE_MIN_MESSAGE_SIZE)
    return new Error('rawBufferSize_ less than minimum');

  //First byte must be SOF
  if(rawBuffer_[0] !== utils.SOF)
    return new Error('first byte not SOF');

  //Length must be valid. The length does not include SOF and CS
  if(rawBuffer_[1] !== (rawBufferSize_ - 2))
    return new Error('invalid length byte');

  var returnValue = utils.isChecksumValid(rawBuffer_, rawBufferSize_);

  //If there was an error pass it back up
  if(returnValue instanceof Error)
    return returnValue;

  //If the checksum is not valid return false
  if(returnValue === false)
    return new Error('invalid checksum');

  //At this point the message is valid, we can break it up

  //Type must be response
  if(rawBuffer_[2] !== utils.RESPONSE)
    return new Error('expecting response message');

  this.mType = rawBuffer_[2];
  this.mFunctionID = rawBuffer_[3];

  //Message data includes the data fields and callback ID if present
  var dataLen = rawBufferSize_ - 5;
  this.mDataBuffer = new Buffer(dataLen);
  this.mDataBufferLen = dataLen;
  rawBuffer_.copy(this.mDataBuffer, 0, 4, 4 + dataLen);

  this.mCS = rawBuffer_[rawBufferSize_ - 1];
  this.mValid = true;

  //Release the rawBuffer passed in as it's no longer needed
  rawBuffer_ = null;

  return true;
}

//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//Expose module methods
exports.BaseMessage = BaseMessage;
exports.getInstance = function(rawBuffer_, rawBufferSize_) {
  return new BaseMessage(rawBuffer_, rawBufferSize_);
}

//Expose methods for testing. This should only be used for testing functions, never in real code
exports.testingPrivate = {
  _clear: _clear,
  _parseRawBuffer: _parseRawBuffer
}