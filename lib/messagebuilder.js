'use strict'

const zutils = require('./zwaveutil.js')
const BaseMessage = require('./zwavemessages/basemessage.js').BaseMessage;
const getVersion = require('./zwavemessages/getversion.js');
const ACK = require('./zwavemessages/ack.js');
const NACK = require('./zwavemessages/nack.js');
const winston = require('winston');


//---------------------------------------------------------------------------------------
/* Create an ACK message
 * Parameters:
 *
 * return: An ACK message
 */
function CreateACK() {
  return ACK.getInstance();
}

/* Create a NACK message
 * Parameters:
 *
 * return: An NACK message
 */
function CreateNACK() {
  return NACK.getInstance();
}

/* Based on incoming raw data attempt to create message object. This function should not be used
 * for ACK/NACK/CAN messages.
 * Parameters:
 *
 * rawData_: Buffer containing raw binary data corresponding to a ZWave message
 *
 * rawDataLen_: then length of the data in the Buffer
 *
 * return: A message object corresponding to the raw data, null if no valid message can be constructed
 */
function GetMessage(rawData_, rawDataLen_) {
  var message = null;

  //Ensure there is data passed in and it's at least the minimum size
  if(rawData_ === null || rawDataLen_ < zutils.ZWAVE_MIN_MESSAGE_SIZE) {
    winston.log('error', 'messageBuilder.GetMessage', 'Invalid raw data');
    return message;
  }


  //Based on the function ID attempt to create appropriate message
  switch(rawData_[3]) {
    case zutils.FUNC_ID_ZW_GET_VERSION:
    {
       message = getVersion.getInstance(rawData_, rawDataLen_);

      //If an error log it
      if((message instanceof Error) || !message.messageValid()) {
        winston.log('error', 'messageBuilder.GetMessage', message.message);
        message = null;
      }
      break;
    }
    case zutils.FUNC_ID_ZW_GET_INIT_DATA:
    case zutils.FUNC_ID_APPLICATION_COMMAND_HANDLER:
    case zutils.FUNC_ID_ZW_SEND_NODE_INFORMATION:
    case zutils.FUNC_ID_ZW_SEND_DATA:
    case zutils.FUNC_ID_ZW_GET_NODE_PROTOCOL_INFO:
    case zutils.FUNC_ID_ASSIGN_RETURN_ROUTE:
    case zutils.FUNC_ID_ZW_REQUEST_NODE_NEIGHBOR_UPDATE:
    case zutils.FUNC_ID_ZW_APPLICATION_UPDATE:
    case zutils.FUNC_ID_ZW_REQUEST_NODE_NEIGHBOR_UPDATE_OPTIONS:
    case zutils.FUNC_ID_ZW_REQUEST_NODE_INFO:
    case zutils.FUNC_ID_ZW_GET_ROUTING_INFO:
    case zutils.FUNC_ID_ZW_GET_ASSOCIATION:
    case zutils.FUNC_ID_UNDEFINED:
    {
      break;
    }
  }

  return message;
}


//---------------------------------------------------------------------------------------
//Expose module methods

exports.MessageBuilder = {
  CreateACK: CreateACK,
  CreateNACK: CreateNACK,
  GetMessage: GetMessage
}