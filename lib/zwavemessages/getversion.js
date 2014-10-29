'use strict'

const util = require('util');
const zutils = require('../zwaveutil.js');
const BaseMessage = require('./basemessage.js').BaseMessage;

/* This is object defines the Get Version (0x15) zwave message. The object inherits from the
 * BaseMessage object.
 */

/* GetVersion constructor. If data is provided it will parse the mDataBuffer which will
 * be populated by the BaseMessage constructor
 *
 * Parameters:
 *
 * rawBuffer: A buffer containing the message binary data, can be null.
 *            If not null must be a valid message. If not null ownership is taken by the object
 *
 * rawBufferSize_: Size of incoming message buffer
 *
 * Return: None
 */
const GetVersion =
  function GetVersion(rawBuffer_, rawBufferSize_) {
    BaseMessage.call(this, rawBuffer_, rawBufferSize_);
    this.mControllerVersion = '';

    //If the BaseMessage decoded the message and the function ID is zutils.FUNC_ID_ZW_GET_VERSION
    if(this.mValid && (this.mFunctionID === zutils.FUNC_ID_ZW_GET_VERSION)) {
      //Set valid to false, as we still need to verify that requirements for this message type are met
      this.mValid = false;
      _parseDataBuffer.call(this, this.mDataBuffer, this.mDataBufferLen);
    }
  }

util.inherits(GetVersion, BaseMessage);

//---------------------------------------------------------------------------------------
/* Generates an association array with the message information.
 *
 * Parameters:
 *
 * None
 *
 * Return: Return an association array with the message information
 */
GetVersion.prototype.getData = function() {
  var messageInformation = BaseMessage.prototype.getData.call(this);

  //Add the controller version
  messageInformation['controllerVersion'] = this.mControllerVersion;

  return messageInformation;
}

//---------------------------------------------------------------------------------------
/* Takes in an association array with message information. In addition to base message
 * requirements the controller version must be passed in.
 *
 * Parameters:
 *
 * messageInfo_: Association array with information to setup message. Fields required
 *               for this message are:
 *                   - controllerVersion -> 12 byte ascii string (populates data and dataLen fields)
 *
 *               Optional fields are:
 *                   - callbackID -> 1 byte callback ID
 *
 * Return: true if message can be constructed from this information, otherwise Error
 */
GetVersion.prototype.setData = function(messageInfo_) {
  var type = null;

  //If a type field was passed in set it. Error handling will be performed in call to base class
  if('type' in messageInfo_)
    type = messageInfo_['type'];

  var dataSize = 0;
  var dataBuffer = null;

  //'callbackID' field is optional in both type cases. If present set the member variable
  if('callbackID' in messageInfo_)
    this.mCallbackID = messageInfo_['callbackID'];

  //There is data only in the response message
  if(type === zutils.RESPONSE) {
    //'controllerVersion' field is required for a response message
    if(!('controllerVersion' in messageInfo_))
      return new Error('Missing controllerVersion field');

    //The controller version is 12 bytes
    dataSize = 12;

    //Verify that the controllerVersion is 12 bytes
    if(messageInfo_['controllerVersion'].length != 12)
      return new Error('Invalid controllerVersion field');

    dataBuffer = new Buffer(dataSize);
    messageInfo_['controllerVersion'].copy(dataBuffer, 0, 0, 12);
  }

  //Set the data and dataLen fields
  messageInfo_['data'] = dataBuffer;
  messageInfo_['dataLen'] = dataSize;

  //Set the functionID
  messageInfo_['functionID'] = zutils.FUNC_ID_ZW_GET_VERSION;

  return BaseMessage.prototype.setData.call(this, messageInfo_);
}

//----------------- Private functions ----------------------------------------------------
//---------------------------------------------------------------------------------------
/* Parse the data buffer portion of a message. Extract the controller version and if applicable
 * get the callback ID. If valid data buffer return true otherwise Error
 * Parameters:
 *
 * dataBuffer_: Data buffer portion of a message
 *
 * dataBufferSize_: Size of the data buffer portion of a message
 *
 * Return: If all data is valid return true, otherwise Error
 */
function _parseDataBuffer(dataBuffer_, dataBufferSize_) {


  //Ensure minimum size is met. Controller version is 12 bytes
  if(dataBufferSize_ < 12)
    return new Error('dataBufferSize_ less than minimum');

  if(dataBufferSize_ > 13)
    return new Error('unexpected data');

  //At this point the data is valid we can break it up

  //Convert the first 12 bytes of data to a string
  this.mControllerVersion = dataBuffer_.toString('utf8', 0, 12);

  //If there is an additional byte, set the callback ID
  if(dataBufferSize_ == 13)
    this.mCallbackID = dataBuffer_[12];

  this.mValid = true;

  return true;
}

//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//Expose module methods
exports.GetVersion = GetVersion;
exports.getInstance = function(rawBuffer_, rawBufferSize_) {
  return new GetVersion(rawBuffer_, rawBufferSize_);
}

//Expose methods for testing. This should only be used for testing functions, never in real code
exports.testingPrivate = {
  _parseDataBuffer: _parseDataBuffer
}