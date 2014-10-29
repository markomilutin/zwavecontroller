'use strict';

/* This class is responsible for transmitting and receving
 * zwave messages via a provided stream interface. Events
 * will be generated as tx timeouts, tx responses, unsolicited rx,
 * comm state and error events occur.
 */

const events = require('events');
const util = require('util');
const BaseMessage = require('./zwavemessages/basemessage.js').BaseMessage;

const MAX_RETRIES = 3;
const TX_TIMEOUT = 5000;

/* BaseMessage constructor. If stream is invalid throw Error
 *
 * Parameters:
 *
 * stream_: Object which provides same events and interface as 'serialport'. Must be valid.
 *
 * Return: None
 */
const MessageHandler =
  function MessageHandler(stream_) {
    events.EventEmitter.call(this);

    //If stream is not valid throw exception
    if(stream_ == null)
      throw new Error('Invalid stream object');

    this.mStream = stream_;

    //Ensure the stream is closed
    this.mStream.close(function onClose(error_) {
      //If there is an error closing the stream, throw Error
      if(error_)
        throw error_;
    });

    //Handle data received over the stream
    this.mStream.on('data', this.rxData);

    _clear.call(this);

    this.mReady = false;
  }

util.inherits(MessageHandler, events.EventEmitter);

//---------------------------------------------------------------------------------------
/* Open the stream object. Will emit 'active' when the stream is ready
 * Parameters:
 *
 * return: None
 */
MessageHandler.prototype.openHandler = function() {
  var self = this;

  this.mStream.open(function onOpenCallback(error_) {
    //If unable to open port emit 'error'
    if(error_) {
      self.emit('error', error_);
      return;
    }

    self.mReady = true;
    self.emit('active');
  });
}

//---------------------------------------------------------------------------------------
/* Close the stream object. Will emit 'inactive' when the stream is closed
 * Parameters:
 *
 * return: None
 */
MessageHandler.prototype.closeHandler = function() {
  var self = this;

  this.mStream.close(function onClose(error_) {
    //If unable to open port emit 'error'
    if(error_) {
      self.emit('error', error_);
      return;
    }

    self.emit('inactive');
  });

  _clear.call(this);
}

//---------------------------------------------------------------------------------------
/* Process incoming data from the stream
 * Parameters:
 *
 * data_: raw data incoming from server
 *
 * return: None
 */
MessageHandler.prototype.rxData = function(data_) {
}

//---------------------------------------------------------------------------------------
/* Populate transaction variables with incoming data and attempt to send message out.
 * Parameters:
 *
 * txMessage_: Message to be sent out, must a be a ZWave message object based on basemessage class
 *
 * requiredResponseMessageIDs_: Responses required in order for tx transaction to be considered
 *                              successfull. This is an array of entries
 *
 * return: None
 */
MessageHandler.prototype.addMessageToSend = function(txMessage_, requiredResponseMessageIDs_) {
  var self = this;

  //If not ready for operation emit an Error
  if(!this.mReady) {
    _clear.call(this);
    self.emit('error', new Error('Not ready for operation'));
    return;
  }

  //If there is an outstanding transaction emit an error
  if(this.mCurrentMessage != null) {
    self.emit('error', new Error('Transaction pending'));
    return;
  }

  //If not an instance of BaseMessage emit an error
  if(!(txMessage_ instanceof BaseMessage)) {
    _clear.call(this);
    self.emit('error', new Error('Not a zwave message'));
    return;
  }

  if((requiredResponseMessageIDs_) === null || requiredResponseMessageIDs_.length === 0) {
    _clear.call(this);
    self.emit('error', new Error('Invalid list of required response IDs'));
    return;
  }

  this.mCurrentMessage = txMessage_;
  this.mRequiredResponseMessageIDs = requiredResponseMessageIDs_;
  this.mCurrentResponseMessages = null;

  _sendMessage.call(this);
}

//--------------------- Private functions -----------------------------------------------

//---------------------------------------------------------------------------------------
/* Clear transaction member variables to defaults
 * Parameters:
 *
 * return: None
 */
function _clear() {
  this.mCurrentMessage = null;
  this.mRequiredResponseMessageIDs = null;
  this.mCurrentResponseMessages = null;
  this.mRetries = 0;
  this.mTimeoutObject = null;

  return;
}

//---------------------------------------------------------------------------------------
/* Generate raw message buffer and send out over stream.
 * Emit an error if not ready, invalid message, transaction pending already or cannot generate raw buffer
 * Parameters:
 *
 * txMessage_: Message to be sent out, must a be a ZWave message object based on basemessage class
 *
 * return: None
 */
function _sendMessage() {
  var self = this;

  //Generate raw data from message to be sent out
  var rawMessage = this.mCurrentMessage.generateMessageBuffer();

  if(rawMessage instanceof Error) {
    _clear.call(self);
    self.emit('error', rawMessage);
    return;
  }

  //Send message out
  self.mStream.write(rawMessage, function onWrite(error_) {
    if(error_) {
      _clear.call(self);
      self.emit('error', error_);
      return;
    }
  });

  this.mTimeoutObject = setTimeout(_handleTxTimeout, TX_TIMEOUT, self);
}

//---------------------------------------------------------------------------------------
/* Handle a tx timeout. If possible retry message, otherwise emit
 * timeout event.
 *
 * Parameters:
 *
 * self_: Reference to the object being dealt with
 *
 * return: None
 */
function _handleTxTimeout(self_) {

  //If there is no outstanding transaction emit error as this should never happen
  if(!self_.mCurrentMessage) {
    _clear.call(self_);
    self_.emit('error', new Error('Timeout when no transaction outstanding'));
    return;
  }

  //If max number of retries have been attempted, emit a txTimeout event
  if(self_.mRetries >= MAX_RETRIES) {
    _clear.call(self_);
    self_.emit('txTimeout');
    return;
  }

  //Resent message, clear out all data received previously and increment retry count
  self_.mCurrentResponseMessages = null;
  self_.mTimeoutObject = null;
  self_.mRetries++;

  _sendMessage.call(self_);
}

//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//Expose module methods
exports.MessageHandler = MessageHandler;
exports.getInstance = function(stream_) {
  return new MessageHandler(stream_);
}

//Expose methods for testing. This should only be used for testing functions, never in real code
exports.testingPrivate = {
  _clear: _clear,
  _sendMessage: _sendMessage,
  _handleTxTimeout: _handleTxTimeout
}
