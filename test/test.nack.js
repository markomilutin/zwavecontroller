'use strict';

const expect = require('expect.js');
const nackMessage = require('../lib/zwavemessages/nack.js');
const zutil = require('../lib/zwaveutil.js');

suite('NACK', function() {
  test('Default constructor' +
       '\n\tPurpose: Instantiate object' +
       '\n\tExpectation: All member variables should be set to defaults',
    function(done) {
      var message = new nackMessage.getInstance();

      expect(message.mType).to.equal(null);
      expect(message.mFunctionID).to.equal(zutil.NACK);
      expect(message.mDataBuffer).to.equal(null);
      expect(message.mDataBufferLen).to.equal(0);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(0);
      expect(message.mValid).to.equal(true);

      done();
    });
  test('getData basic' +
       '\n\tPurpose: Create object and call function' +
       '\n\tExpectation: Association array should be returned with expected data for NACK',
    function(done) {
      var message = new nackMessage.getInstance();

      var messageData = message.getData();

      expect(messageData).not.equal(null);
      expect(messageData['type']).to.equal(null);
      expect(messageData['functionID']).to.equal(zutil.NACK);
      expect(messageData['data']).to.equal(null);
      expect(messageData['dataLen']).to.equal(0);
      expect(messageData['callbackID']).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(messageData['cs']).to.equal(0);
      expect(messageData['valid']).to.equal(true);

      done();
    });

  test('generateMessageBuffer test' +
       '\n\tPurpose: Attempt to generate the message buffer for NACK' +
       '\n\tExpectation: Raw message buffer should be returned',
    function(done) {

      var message = new nackMessage.getInstance();
      expect(message).not.equal(null);

      var messageRawBuffer = message.generateMessageBuffer();

      expect(messageRawBuffer).not.be(Error);
      expect(messageRawBuffer).not.equal(null);
      expect(messageRawBuffer.length).to.equal(1);
      expect(messageRawBuffer[0]).to.equal(zutil.NACK);

      done();
    });

  test('setData test' +
       '\n\tPurpose: Pass random message info' +
       '\n\tExpectation: true should be returned an there should be no changes',
    function(done) {
      var message = new nackMessage.getInstance();

      expect(message).not.equal(null);

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

      var result = message.setData(messageData);

      expect(result).to.equal(true);
      expect(message.mCS).to.equal(0)
      expect(message.mDataBuffer).to.equal(null)

      done();
    });
});