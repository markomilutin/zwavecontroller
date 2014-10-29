'use strict';

const expect = require('expect.js');
const baseMessage = require('../lib/zwavemessages/basemessage.js');
const messageHandler = require('../lib/messagehandler.js');
const messageHandlerPrivate = require('../lib/messagehandler.js').testingPrivate;
const zutil = require('../lib/zwaveutil.js');
const sinon = require('sinon');
const testStream = require('./testhelpers/teststream.js');

suite('MessageHandler', function() {
  test('Default constructor' +
       '\n\tPurpose: Instantiate object with a null stream' +
       '\n\tExpectation: An Error exception should be thrown',
    function(done) {
      try {
        var handler = messageHandler.getInstance(null);
      } catch(ex_) {
        expect(ex_).to.be.an(Error)
        expect(ex_.message).to.be('Invalid stream object');
        done();
      }
    });
  test('Default constructor cannot close stream' +
       '\n\tPurpose: The stream object provided cannot be closed' +
       '\n\tExpectation: An Error exception should be thrown',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, "close");
      closeStub.callsArgWith(0, new Error('close fail'));

      try {
        var handler = messageHandler.getInstance(stream);
      } catch(ex_) {
        expect(ex_).to.be.an(Error)
        expect(ex_.message).to.be('close fail');
        done();
      }
    });
  test('Default constructor valid' +
       '\n\tPurpose: Pass in a valid stream object' +
       '\n\tExpectation: Object should be created',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, "close");

      var handler = messageHandler.getInstance(stream);
      expect(handler).not.equal(null)

      //Verify member variables intialized
      expect(handler.mCurrentMessage).to.equal(null);
      expect(handler.mRequiredResponseMessageIDs).to.equal(null);
      expect(handler.mCurrentResponseMessages).to.equal(null);
      expect(handler.mReady).to.equal(false);
      expect(handler.mRetries).to.equal(0);
      expect(handler.mTimeoutObject).to.equal(null);
      done();
    });
  test('openHandler error' +
       '\n\tPurpose: Attempt to open handler when there is an error' +
       '\n\tExpectation: An error should be emitted',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');

      openStub.callsArgWith(0, new Error('open fail'));

      var handler = messageHandler.getInstance(stream);
      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      handler.on('error', function handlerAsync(error_) {
        expect(error_).to.be.an(Error)
        expect(error_.message).to.be('open fail');

        done();
      });

      handler.openHandler();
    });

  test('openHandler no error' +
       '\n\tPurpose: Attempt to open handler when there is no error' +
       '\n\tExpectation: An inactive event should be emitted',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');

      openStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);
      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      handler.on('active', function handlerAsync() {
        done();
      });

      handler.openHandler();
    });
  test('closeHandler error' +
       '\n\tPurpose: Attempt to close handler when there is an error' +
       '\n\tExpectation: An error should be emitted',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');

      var handler = messageHandler.getInstance(stream);
      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      handler.on('error', function handlerAsync(error_) {
        expect(error_).to.be.an(Error)
        expect(error_.message).to.be('close fail');

        done();
      });

      closeStub.callsArgWith(0, new Error('close fail'));

      handler.closeHandler();
    });

  test('closeHandler no error' +
       '\n\tPurpose: Attempt to open handler when there is no error' +
       '\n\tExpectation: An inactive event should be emitted',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);
      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      handler.on('inactive', function handlerAsync() {
        done();
      });

      handler.closeHandler();
    });

  test('sendMessage error generating buffer' +
       '\n\tPurpose: Attempt to send message out when raw buffer generation fails' +
       '\n\tExpectation: An error should be emitted, and member variables should be set to default',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);


      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      handler.on('error', function handlerAsync(error_) {
        expect(error_).to.be.an(Error);
        expect(error_.message).to.be('Cannot generate buffer with invalid data');

        expect(handler.mCurrentMessage).to.equal(null);
        expect(handler.mRequiredResponseMessageIDs).to.equal(null);
        expect(handler.mRetries).to.equal(0);
        expect(handler.mTimeoutObject).to.equal(null);

        done();
      });

      //Attempt to send invalid message
      handler.mCurrentMessage = new baseMessage.getInstance();
      handler.mRetries = 1;
      messageHandlerPrivate._sendMessage.call(handler);

      handler.closeHandler();
    });

  test('sendMessage error writing' +
       '\n\tPurpose: Attempt to send message out when there is an error writing to stream' +
       '\n\tExpectation: An error should be emitted',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      handler.on('error', function handlerAsync(error_) {
        expect(error_).to.be.an(Error);
        expect(error_.message).to.be('write fail');

        expect(handler.mCurrentMessage).to.equal(null);
        expect(handler.mRequiredResponseMessageIDs).to.equal(null);
        expect(handler.mRetries).to.equal(0);
        expect(handler.mTimeoutObject).to.equal(null);

        done();
      });

      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      handler.mCurrentMessage = new baseMessage.getInstance();
      handler.mCurrentMessage.setData(messageData);

      //Create an error when writing data
      writeStub.callsArgWith(1, new Error('write fail'));

      messageHandlerPrivate._sendMessage.call(handler);

      handler.closeHandler();
    });

  test('sendMessage no error' +
       '\n\tPurpose: Send message with no issue' +
       '\n\tExpectation: The timeout object should be set',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      handler.mCurrentMessage = new baseMessage.getInstance();
      handler.mCurrentMessage.setData(messageData);

      //No error when when writing data
      writeStub.callsArgWith(1);

      expect(handler.mTimeoutObject).to.equal(null);

      messageHandlerPrivate._sendMessage.call(handler);

      expect(handler.mTimeoutObject).not.equal(null);

      handler.closeHandler();

      done();
    });

  test('_handleTxTimeout no message' +
       '\n\tPurpose: Function called when there is no outstanding message to transfer' +
       '\n\tExpectation: An error should be emitted',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      handler.on('error', function handlerAsync(error_) {
        expect(error_).to.be.an(Error);
        expect(error_.message).to.be('Timeout when no transaction outstanding');

        expect(handler.mCurrentMessage).to.equal(null);
        expect(handler.mRequiredResponseMessageIDs).to.equal(null);
        expect(handler.mRetries).to.equal(0);
        expect(handler.mTimeoutObject).to.equal(null);

        done();
      });

      messageHandlerPrivate._handleTxTimeout(handler);

      handler.closeHandler();
    });

  test('_handleTxTimeout no more retries' +
       '\n\tPurpose: Function called when there are no more retries allowed' +
       '\n\tExpectation: An error should be emitted',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      handler.on('txTimeout', function handlerAsync() {
        expect(handler.mCurrentMessage).to.equal(null);
        expect(handler.mRequiredResponseMessageIDs).to.equal(null);
        expect(handler.mRetries).to.equal(0);
        expect(handler.mTimeoutObject).to.equal(null);

        done();
      });

      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      handler.mCurrentMessage = new baseMessage.getInstance();
      handler.mCurrentMessage.setData(messageData);

      handler.mRetries = 10;
      messageHandlerPrivate._handleTxTimeout(handler);

      handler.closeHandler();
    });

  test('_handleTxTimeout retry allowed' +
       '\n\tPurpose: There are still retries allowed' +
       '\n\tExpectation: The current response messages should be cleared, timeoutObject should be set, retries should be incremented and message should be sent out again',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');
      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      handler.mCurrentMessage = new baseMessage.getInstance();
      handler.mCurrentMessage.setData(messageData);

      handler.mRetries = 1;
      handler.mCurrentResponseMessages = 1; //set to a value
      handler.mTimeoutObject = 2; //set to a value

      messageHandlerPrivate._handleTxTimeout(handler);

      expect(handler.mRetries).to.equal(2);
      expect(handler.mCurrentResponseMessages).to.equal(null);
      expect(handler.mTimeoutObject).not.equal(null);

      //Verify call to send message out was made by verifying write was called on the stream
      sinon.assert.calledOnce(writeStub);

      handler.closeHandler();

      done();
    });

  test('addMessageToSend not ready' +
       '\n\tPurpose: Attempt to add message when not ready' +
       '\n\tExpectation: An error should be emitted, and transaction member variables should be cleared',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      handler.on('error', function handlerAsync(error_) {

        expect(error_).to.be.an(Error);
        expect(error_.message).to.be('Not ready for operation');

        expect(handler.mCurrentMessage).to.equal(null);
        expect(handler.mRequiredResponseMessageIDs).to.equal(null);
        expect(handler.mRetries).to.equal(0);
        expect(handler.mTimeoutObject).to.equal(null);

        done();
      });

      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      var message = new baseMessage.getInstance();
      message.setData(messageData);

      //Set to a value, we want to clarify they get cleared
      handler.mRetries = 1;
      handler.mCurrentMessage = 1;
      handler.mRequiredResponseMessageIDs = 2;
      handler.mCurrentResponseMessages = 3;

      handler.addMessageToSend(message, []);

      handler.closeHandler();
    });

  test('addMessageToSend transaction pending' +
       '\n\tPurpose: Attempt to add message when there is an outstanding message' +
       '\n\tExpectation: An error should be emitted',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);


      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      var message = new baseMessage.getInstance();
      message.setData(messageData);

      handler.on('error', function handlerAsync(error_) {

        expect(error_).to.be.an(Error);
        expect(error_.message).to.be('Transaction pending');

        expect(handler.mCurrentMessage).to.equal(message);

        done();
      });

      handler.mReady = true;
      handler.mRetries = 1;
      handler.mCurrentMessage = message;
      handler.mRequiredResponseMessageIDs = 2;
      handler.mCurrentResponseMessages = 3;

      handler.addMessageToSend(message, []);

      handler.closeHandler();
    });

  test('addMessageToSend invalid message' +
       '\n\tPurpose: Attempt to add message that is not derived from BaseMessage' +
       '\n\tExpectation: An error should be emitted and transaction member varialbes should be cleared',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);


      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      var message = new baseMessage.getInstance();
      message.setData(messageData);

      handler.on('error', function handlerAsync(error_) {
        expect(error_).to.be.an(Error);
        expect(error_.message).to.be('Not a zwave message');

        expect(handler.mCurrentMessage).to.equal(null);
        expect(handler.mRequiredResponseMessageIDs).to.equal(null);
        expect(handler.mRetries).to.equal(0);
        expect(handler.mTimeoutObject).to.equal(null);
        expect(handler.mReady).to.equal(true);

        done();
      });

      handler.mReady = true;
      handler.mRetries = 1;
      handler.mCurrentMessage = null;
      handler.mRequiredResponseMessageIDs = 2;
      handler.mCurrentResponseMessages = 3;

      handler.addMessageToSend(1, []);

      handler.closeHandler();
    });

  test('addMessageToSend invalid response message IDs' +
       '\n\tPurpose: Attempt to add message with null repsonse message IDs' +
       '\n\tExpectation: An error should be emitted and transaction member varialbes should be cleared',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      var message = new baseMessage.getInstance();
      message.setData(messageData);

      handler.on('error', function handlerAsync(error_) {
        expect(error_).to.be.an(Error);
        expect(error_.message).to.be('Invalid list of required response IDs');

        expect(handler.mCurrentMessage).to.equal(null);
        expect(handler.mRequiredResponseMessageIDs).to.equal(null);
        expect(handler.mRetries).to.equal(0);
        expect(handler.mTimeoutObject).to.equal(null);
        expect(handler.mReady).to.equal(true);

        done();
      });

      handler.mReady = true;
      handler.mRetries = 1;
      handler.mCurrentMessage = null;
      handler.mRequiredResponseMessageIDs = 2;
      handler.mCurrentResponseMessages = 3;

      handler.addMessageToSend(message, null);

      handler.closeHandler();
    });

  test('addMessageToSend no response message IDs' +
       '\n\tPurpose: Attempt to add message with no response message IDs' +
       '\n\tExpectation: An error should be emitted and transaction member varialbes should be cleared',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      var message = new baseMessage.getInstance();
      message.setData(messageData);

      handler.on('error', function handlerAsync(error_) {
        expect(error_).to.be.an(Error);
        expect(error_.message).to.be('Invalid list of required response IDs');

        expect(handler.mCurrentMessage).to.equal(null);
        expect(handler.mRequiredResponseMessageIDs).to.equal(null);
        expect(handler.mRetries).to.equal(0);
        expect(handler.mTimeoutObject).to.equal(null);
        expect(handler.mReady).to.equal(true);

        done();
      });

      handler.mReady = true;
      handler.mRetries = 1;
      handler.mCurrentMessage = null;
      handler.mRequiredResponseMessageIDs = 2;
      handler.mCurrentResponseMessages = 3;

      handler.addMessageToSend(message, []);

      handler.closeHandler();
    });

  test('addMessageToSend no error' +
       '\n\tPurpose: Add message to send with no error with no issue' +
       '\n\tExpectation: The timeout object should be set and call to stream write should be called. Transaction member variables should be set',
    function(done) {
      var stream = testStream.getInstance();
      var closeStub = sinon.stub(stream, 'close');
      var openStub = sinon.stub(stream, 'open');
      var writeStub = sinon.stub(stream, 'write');

      closeStub.callsArg(0);

      var handler = messageHandler.getInstance(stream);

      expect(handler).not.equal(null)
      expect(handler).to.be.an(messageHandler.MessageHandler);

      //Attempt to send valid message
      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      var data  = new Buffer(5);
      messageData['data'] = data;
      data[0] = 1;
      data[1] = 2;
      data[2] = 3;
      data[3] = 4;
      data[4] = 5;
      messageData['dataLen'] = 5;
      var message = new baseMessage.getInstance();
      message.setData(messageData);

      //No error when when writing data
      writeStub.callsArgWith(1);

      expect(handler.mTimeoutObject).to.equal(null);

      handler.mReady = true;
      handler.mRequiredResponseMessageIDs = 1;
      handler.addMessageToSend(message, [1,2,3]);

      expect(handler.mTimeoutObject).not.equal(null);

      sinon.assert.calledOnce(writeStub);

      expect(handler.mCurrentMessage).to.equal(message);
      expect(handler.mRequiredResponseMessageIDs[0]).to.equal(1);
      expect(handler.mRequiredResponseMessageIDs[1]).to.equal(2);
      expect(handler.mRequiredResponseMessageIDs[2]).to.equal(3);
      expect(handler.mCurrentResponseMessages).to.equal(null);

      handler.closeHandler();

      done();
    });

});
