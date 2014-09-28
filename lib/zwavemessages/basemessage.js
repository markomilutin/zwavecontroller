'use strict'

const utils = require('../zwaveutil.js');

/* This is a base zwave message object. It will encapsulate data and
 * functions that all messages should support.
 */

/* BaseMessage constructor. If a raw buffer is provided it will be parsed
 * for base message data
 * Parameters:
 *
 * rawBuffer: A buffer containing the message binary data, can be null.
 *            If not null must be a valid message. If not null ownership is taken by the object
 *
 *
 * Return: None
 */
const BaseMessage = function BaseMessage(rawBuffer_, rawBufferSize_) {
  //Set default values for variables
  this.mType = utils.REQUEST;
  this.mFunctionID = utils.FUNC_ID_UNDEFINED;
  this.mDataBuffer = null;
  this.mDataBufferLen = 0;
  this.mCallbackID = utils.INVALID_CALLBACK_ID;
  this.mCS = 0;
  this.mValid = false;

  if(rawBuffer_ && rawBufferSize_ > 0)
    this.parseRawBuffer(rawBuffer_, rawBufferSize_);

}

BaseMessage.prototype = {

  /* Parse the raw buffer, validate data and assign member variables.
   * If message is not valid return false, otherwise true
   * Parameters:
   *
   * rawBuffer_: Buffer containing the data to be parsed
   *
   * rawBufferSize_: Size of the input buffer, expected to be at least 5 bytes
   *
   * Return: If all data is valid return true, otherwise Error
   */
  parseRawBuffer: function(rawBuffer_, rawBufferSize_) {

    //Ensure minimum size is met
    if(rawBufferSize_ < utils.ZWAVE_MIN_MESSAGE_SIZE)
      return new Error('rawBufferSize_ less than minimum');

    //First byte must be SOF
    if(rawBuffer_[0] != utils.SOF)
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

    //Type must be either request or response
    if(rawBuffer_[2] != utils.REQUEST && rawBuffer_[2] != utils.RESPONSE)
      return new Error('invalid message type [' + rawBuffer_[2] + ']');

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
  },

  /* Generates an association array with the message information.
   * If message is not valid returns an error
   * Parameters:
   *
   * None
   *
   * Return: If possible return an association array with the message information otherwise an error
   */
  getData: function() {
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
  },

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
  setData: function(messageInfo_) {
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

    //Generate the CS
//    var messageBuffer = generateMessageBuffer();
    //Message can be generated from data passed in
//    this.

    return null;
  },

  /* Generate message Buffer from the data contained in the object.
   * Generated buffer contains a full zwave message ready for transmission (buffer size is message size).
   * An Error is raised if message cannot be generated
   * Parameters:
   *
   * Return: Buffer if a message can be generated, otherwise Error
   */
  generateMessageBuffer: function() {
    //Message must be valid
    if(!this.mValid)
      return new Error('Cannot generate buffer with invalid data');

    //Create raw buffer
    var messageBuffer = new Buffer(utils.ZWAVE_MIN_MESSAGE_SIZE + this.mDataLen);

    //Populate buffer
    messageBuffer[0] = utils.SOF;
    messageBuffer[1] = this.mDataLen + 3;
    messageBuffer[2] = this.mType;
    messageBuffer[3] = this.mFunctionID;

    return null;
  },
}

//Expose module methods
exports.BaseMessage = BaseMessage;
exports.getInstance = function(rawBuffer_, rawBufferSize_) {
  return new BaseMessage(rawBuffer_, rawBufferSize_);
}