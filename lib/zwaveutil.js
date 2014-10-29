'use strict';

/* ZWave utility functions and constants are defined here
 *
 */

//Message Types
const REQUEST = 0x00;
const RESPONSE = 0x01;

//Special message IDs. These messages are only one byte
const ACK = 0x06;
const NACK = 0x15;
const CAN = 0x18;

const INVALID_CALLBACK_ID = 0xFF;

//Message IDs
const FUNC_ID_UNDEFINED = 0xFF;
const FUNC_ID_ZW_GET_INIT_DATA = 0x02;
const FUNC_ID_APPLICATION_COMMAND_HANDLER = 0x04;
const FUNC_ID_ZW_SEND_NODE_INFORMATION = 0x12;
const FUNC_ID_ZW_SEND_DATA = 0x13;
const FUNC_ID_ZW_GET_VERSION = 0x15;
const FUNC_ID_ZW_GET_NODE_PROTOCOL_INFO = 0x41;
const FUNC_ID_ASSIGN_RETURN_ROUTE = 0x46;
const FUNC_ID_ZW_REQUEST_NODE_NEIGHBOR_UPDATE = 0x48;
const FUNC_ID_ZW_APPLICATION_UPDATE = 0x49;
const FUNC_ID_ZW_REQUEST_NODE_NEIGHBOR_UPDATE_OPTIONS = 0x5a;
const FUNC_ID_ZW_REQUEST_NODE_INFO = 0x60;
const FUNC_ID_ZW_GET_ROUTING_INFO = 0x80;
const FUNC_ID_ZW_GET_ASSOCIATION = 0x85;

//Message information
const SOF = 0x01;
const ZWAVE_MIN_MESSAGE_SIZE = 5; //Include SOF, LEN, MSG TYPE, FUNC and CS

/* Calculate the ZWave API checksum give a data buffer.
 * Synchronous function.
 * Parameters:
 *
 * messageBuffer_: Buffer with raw binary message data
 *
 * Return: Passes back the calculated checksum or an error
 */
function calcCS(messageBuffer_, bufferLen_) {
  let cs = 0xFF;

  //If the buffer lenght provided is greater than the total buffer, return an error
  if(bufferLen_ > messageBuffer_.length) {
    return new Error('Buffer length specified is bigger than actual buffer');
  }

  //Go through and calculate checksum on all bytes
  for(var i = 0; i < bufferLen_; i++) {
    cs ^= messageBuffer_[i];
  }

  return cs;
};

/* Validates the checksum for message provided as a Buffer.
 * Synchronous function.
 * Parameters:
 *
 * messageBuffer_: Buffer with raw binary mesasge data
 *
 * bufferLen_: Length of the message buffer
 *
 * Return: Returns True/False depending if the checksum is valid or an Error
 */
function isChecksumValid(messageBuffer_, bufferLen_) {

  //If the buffer lenght passed in is greater than the total size of the buffer return an error
  if(bufferLen_ > messageBuffer_.length)
    return new Error('Buffer length specified is bigger than actual buffer');

  if(bufferLen_ < ZWAVE_MIN_MESSAGE_SIZE)
    return new Error('Message smaller than minimum size');

  //Get all the message data except the SOF and CS
  var dataToCalculateChecksum = messageBuffer_.slice(1, bufferLen_ - 1);

  var result = calcCS(dataToCalculateChecksum, bufferLen_ - 2);

  //If there was an error pass it back up
  if(result instanceof Error)
    return result;

  //If the calculate checksum does not equal the passed in value return FALSE
  if(result !== messageBuffer_[bufferLen_ - 1])
    return false;

  return true;
}

//Expose module methods and constants
module.exports = {
  //Utils functions
  calcCS: calcCS,
  isChecksumValid: isChecksumValid,

  //Constants
  REQUEST: REQUEST,
  RESPONSE: RESPONSE,
  ACK: ACK,
  SOF: SOF,
  NACK: NACK,
  INVALID_CALLBACK_ID: INVALID_CALLBACK_ID,
  FUNC_ID_UNDEFINED: FUNC_ID_UNDEFINED,
  FUNC_ID_ZW_GET_INIT_DATA: FUNC_ID_ZW_GET_INIT_DATA,
  FUNC_ID_APPLICATION_COMMAND_HANDLER: FUNC_ID_APPLICATION_COMMAND_HANDLER,
  FUNC_ID_ZW_SEND_NODE_INFORMATION: FUNC_ID_ZW_SEND_NODE_INFORMATION,
  FUNC_ID_ZW_SEND_DATA: FUNC_ID_ZW_SEND_DATA,
  FUNC_ID_ZW_GET_VERSION: FUNC_ID_ZW_GET_VERSION,
  FUNC_ID_ZW_GET_NODE_PROTOCOL_INFO: FUNC_ID_ZW_GET_NODE_PROTOCOL_INFO,
  FUNC_ID_ASSIGN_RETURN_ROUTE: FUNC_ID_ASSIGN_RETURN_ROUTE,
  FUNC_ID_ZW_REQUEST_NODE_NEIGHBOR_UPDATE: FUNC_ID_ZW_REQUEST_NODE_NEIGHBOR_UPDATE,
  FUNC_ID_ZW_APPLICATION_UPDATE: FUNC_ID_ZW_APPLICATION_UPDATE,
  FUNC_ID_ZW_REQUEST_NODE_NEIGHBOR_UPDATE_OPTIONS: FUNC_ID_ZW_REQUEST_NODE_NEIGHBOR_UPDATE_OPTIONS,
  FUNC_ID_ZW_REQUEST_NODE_INFO: FUNC_ID_ZW_REQUEST_NODE_INFO,
  FUNC_ID_ZW_GET_ROUTING_INFO: FUNC_ID_ZW_GET_ROUTING_INFO,
  FUNC_ID_ZW_GET_ASSOCIATION: FUNC_ID_ZW_GET_ASSOCIATION,
  ZWAVE_MIN_MESSAGE_SIZE: ZWAVE_MIN_MESSAGE_SIZE
};
