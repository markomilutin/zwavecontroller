'use strict';

const expect = require('expect.js');
const baseMessage = require('../lib/zwavemessages/basemessage.js');
const baseMessagePrivate = require('../lib/zwavemessages/basemessage.js').testingPrivate;
const zutil = require('../lib/zwaveutil.js');

suite('BaseMessage', function() {
  test('Default constructor' +
       '\n\tPurpose: Instantiate object with no raw data' +
       '\n\tExpectation: All member variables should be set to defaults',
    function(done) {
      var message = new baseMessage.getInstance(null, 0);

      expect(message.mType).to.equal(zutil.REQUEST);
      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_UNDEFINED);
      expect(message.mDataBuffer).to.equal(null);
      expect(message.mDataBufferLen).to.equal(0);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(0);
      expect(message.mValid).to.equal(false);

      done();
    });
  test('Default constructor 2' +
       '\n\tPurpose: Instantiate object with no raw data, but the rawBufferSize is not 0' +
       '\n\tExpectation: All member variables should be set to defaults',
    function(done) {
      var message = new baseMessage.getInstance(null, 11);

      expect(message.mType).to.equal(zutil.REQUEST);
      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_UNDEFINED);
      expect(message.mDataBuffer).to.equal(null);
      expect(message.mDataBufferLen).to.equal(0);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(0);
      expect(message.mValid).to.equal(false);

      done();
    });

  test('Default constructor 3' +
       '\n\tPurpose: Instantiate object with raw data, but the rawBufferSize is 0' +
       '\n\tExpectation: All member variables should be set to defaults',
    function(done) {
      var testBuffer = new Buffer(10);
      var message = new baseMessage.getInstance(testBuffer, 4);

      expect(message.mType).to.equal(zutil.REQUEST);
      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_UNDEFINED);
      expect(message.mDataBuffer).to.equal(null);
      expect(message.mDataBufferLen).to.equal(0);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(0);
      expect(message.mValid).to.equal(false);

      done();
    });
  test('_parseRawBuffer buffer size less than minimum' +
       '\n\tPurpose: Pass in buffer size that is less than minimum required' +
       '\n\tExpectation: An Error should be generated',
    function(done) {
      var testBuffer = new Buffer(10);
      var message = new baseMessage.getInstance(null, 0);

      var result = baseMessagePrivate._parseRawBuffer.call(message, testBuffer, 4);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('rawBufferSize_ less than minimum');

      done();
    });
  test('_parseRawBuffer first byte not SOF' +
       '\n\tPurpose: Pass in buffer whose first byte is not SOF' +
       '\n\tExpectation: An Error should be generated',
    function(done) {
      var testBuffer = new Buffer(10);
      var message = new baseMessage.getInstance(null, 0);

      testBuffer[0] = 0x1B;
      var result = baseMessagePrivate._parseRawBuffer.call(message, testBuffer, 10);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('first byte not SOF');

      done();
    });
  test('_parseRawBuffer length invalid' +
       '\n\tPurpose: Pass in buffer whose length byte does not represent the message' +
       '\n\tExpectation: An Error should be generated',
    function(done) {
      var testBuffer = new Buffer(10);
      var message = new baseMessage.getInstance(null, 0);

      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 30;
      var result = baseMessagePrivate._parseRawBuffer.call(message, testBuffer, 10);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('invalid length byte');

      done();
    });
  test('_parseRawBuffer cs invalid' +
       '\n\tPurpose: Pass in buffer whose cs byte is not valid' +
       '\n\tExpectation: An Error should be generated',
    function(done) {
      var testBuffer = new Buffer(10);
      var message = new baseMessage.getInstance(null, 0);

      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 4;
      testBuffer[2] = 0x00;
      testBuffer[3] = 0x01;
      testBuffer[4] = 0x02;
      testBuffer[5] = 0xFF; // CS

      var result = baseMessagePrivate._parseRawBuffer.call(message, testBuffer, 6);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('invalid checksum');

      done();
    });
  test('_parseRawBuffer message type request' +
       '\n\tPurpose: Pass in buffer whose message type byte is a request' +
       '\n\tExpectation: An Error should be generated',
    function(done) {
      var testBuffer = new Buffer(10);
      var message = new baseMessage.getInstance(null, 0);

      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 4;
      testBuffer[2] = 0x05;
      testBuffer[3] = 0x01;
      testBuffer[4] = 0x02;
      testBuffer[5] = zutil.calcCS(testBuffer.slice(1,5), 4); // CS
      var result = baseMessagePrivate._parseRawBuffer.call(message, testBuffer, 6);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('expecting response message');

      done();
    });
  test('_parseRawBuffer valid message' +
       '\n\tPurpose: Pass in buffer which contains valid message' +
       '\n\tExpectation: No error should be generated and fields should be properly populated',
    function(done) {
      var testBuffer = new Buffer(10);
      var message = new baseMessage.getInstance(null, 0);

      expect(message.mValid).to.be(false);

      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 6;
      testBuffer[2] = zutil.RESPONSE;
      testBuffer[3] = 0x03;
      testBuffer[4] = 0x01;
      testBuffer[5] = 0x02;
      testBuffer[6] = 0x03;
      testBuffer[7] = zutil.calcCS(testBuffer.slice(1,7), 6); // CS

      var result = baseMessagePrivate._parseRawBuffer.call(message, testBuffer, 8);

      expect(result).to.be(true);

      expect(message.mValid).to.be(true);

      expect(message.mType).to.equal(zutil.RESPONSE);
      expect(message.mFunctionID).to.equal(0x03);
      expect(message.mDataBuffer).not.equal(null);
      expect(message.mDataBufferLen).to.equal(3);
      expect(message.mDataBuffer[0]).to.equal(1);
      expect(message.mDataBuffer[1]).to.equal(2);
      expect(message.mDataBuffer[2]).to.equal(3);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(testBuffer[7]);

      done();
    });
  test('Default Constructor pass in valid message' +
       '\n\tPurpose: Pass in buffer which contains valid message when creating object' +
       '\n\tExpectation: No error should be generated and fields should be properly populated',
    function(done) {
      var testBuffer = new Buffer(10);

      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 6;
      testBuffer[2] = zutil.RESPONSE;
      testBuffer[3] = 0x03;
      testBuffer[4] = 0x01;
      testBuffer[5] = 0x02;
      testBuffer[6] = 0x03;
      testBuffer[7] = zutil.calcCS(testBuffer.slice(1,7), 6); // CS

      var message = new baseMessage.getInstance(testBuffer, 8);

      expect(message).not.equal(null);

      expect(message.mValid).to.be(true);

      expect(message.mType).to.equal(zutil.RESPONSE);
      expect(message.mFunctionID).to.equal(0x03);
      expect(message.mDataBuffer).not.equal(null);
      expect(message.mDataBufferLen).to.equal(3);
      expect(message.mDataBuffer[0]).to.equal(1);
      expect(message.mDataBuffer[1]).to.equal(2);
      expect(message.mDataBuffer[2]).to.equal(3);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(testBuffer[7]);

      done();
    });
  test('getData empty message' +
       '\n\tPurpose: Create object with no initialization data and call function' +
       '\n\tExpectation: Association array should be returned with default data',
    function(done) {
      var message = new baseMessage.getInstance(null, 0);

      var messageData = message.getData();

      expect(messageData).not.equal(null);
      expect(messageData['type']).to.equal(zutil.REQUEST);
      expect(messageData['functionID']).to.equal(zutil.FUNC_ID_UNDEFINED);
      expect(messageData['data']).to.equal(null);
      expect(messageData['dataLen']).to.equal(0);
      expect(messageData['callbackID']).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(messageData['cs']).to.equal(0);
      expect(messageData['valid']).to.equal(false);

      done();
    });
  test('getData valid message' +
       '\n\tPurpose: Create object with a valid message raw buffer and call function' +
       '\n\tExpectation: Association array should be returned with correct data',
    function(done) {
      var testBuffer = new Buffer(10);
      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 6;
      testBuffer[2] = zutil.RESPONSE;
      testBuffer[3] = 0x03;
      testBuffer[4] = 0xAC;
      testBuffer[5] = 0xFE;
      testBuffer[6] = 0xFF;
      testBuffer[7] = zutil.calcCS(testBuffer.slice(1,7), 6); // CS

      var message = new baseMessage.getInstance(testBuffer, 8);

      expect(message).not.equal(null);

      var messageData = message.getData();

      expect(messageData).not.equal(null);
      expect(messageData['type']).to.equal(zutil.RESPONSE);
      expect(messageData['functionID']).to.equal(0x03);
      expect(messageData['data']).not.equal(null);
      expect(messageData['data'][0]).to.equal(0xAC);
      expect(messageData['data'][1]).to.equal(0xFE);
      expect(messageData['data'][2]).to.equal(0xFF);
      expect(messageData['dataLen']).to.equal(3);
      expect(messageData['callbackID']).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(messageData['cs']).to.equal(testBuffer[7]);
      expect(messageData['valid']).to.equal(true);

      done();
    });
  test('generateMessageBuffer invalid message' +
       '\n\tPurpose: Attempt to generate the message buffer when data is not valid' +
       '\n\tExpectation: An Error should be returned',
    function(done) {
      var message = new baseMessage.getInstance(null, 8);

      expect(message).not.equal(null);

      var result = message.generateMessageBuffer();

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Cannot generate buffer with invalid data');

      done();
    });
  test('generateMessageBuffer valid message' +
       '\n\tPurpose: Attempt to generate the message buffer when data is valid' +
       '\n\tExpectation: Raw message buffer should be returned',
    function(done) {

      var message = new baseMessage.getInstance(null, 0);
      expect(message).not.equal(null);

      message.mValid = true;
      message.mType = zutil.REQUEST;
      message.mFunctionID = 0x04;
      message.mDataBufferLen = 5;
      message.mDataBuffer = new Buffer(20);
      message.mDataBuffer[0] = 0xAA;
      message.mDataBuffer[1] = 0xAB;
      message.mDataBuffer[2] = 0xAC;
      message.mDataBuffer[3] = 0xAD;
      message.mDataBuffer[4] = 0x11;

      var messageRawBuffer = message.generateMessageBuffer();

      expect(messageRawBuffer).not.be(Error);
      expect(messageRawBuffer).not.equal(null);
      expect(messageRawBuffer.length).to.equal(10);
      expect(messageRawBuffer[0]).to.equal(zutil.SOF);
      expect(messageRawBuffer[1]).to.equal(8);
      expect(messageRawBuffer[2]).to.equal(zutil.REQUEST);
      expect(messageRawBuffer[3]).to.equal(0x04);
      expect(messageRawBuffer[4]).to.equal(0xAA);
      expect(messageRawBuffer[5]).to.equal(0xAB);
      expect(messageRawBuffer[6]).to.equal(0xAC);
      expect(messageRawBuffer[7]).to.equal(0xAD);
      expect(messageRawBuffer[8]).to.equal(0x11);
      expect(messageRawBuffer[9]).to.equal(0xE2);

      done();
    });

  test('generateMessageBuffer valid message' +
       '\n\tPurpose: Attempt to generate the message buffer when data is valid' +
       '\n\tExpectation: Raw message buffer should be returned',
    function(done) {

      var message = new baseMessage.getInstance(null, 0);
      expect(message).not.equal(null);

      message.mValid = true;
      message.mType = zutil.REQUEST;
      message.mFunctionID = 0x04;
      message.mDataBufferLen = 5;
      message.mDataBuffer = new Buffer(20);
      message.mDataBuffer[0] = 0xAA;
      message.mDataBuffer[1] = 0xAB;
      message.mDataBuffer[2] = 0xAC;
      message.mDataBuffer[3] = 0xAD;
      message.mDataBuffer[4] = 0x11;

      var messageRawBuffer = message.generateMessageBuffer();

      expect(messageRawBuffer).not.be(Error);
      expect(messageRawBuffer).not.equal(null);
      expect(messageRawBuffer.length).to.equal(10);
      expect(messageRawBuffer[0]).to.equal(zutil.SOF);
      expect(messageRawBuffer[1]).to.equal(8);
      expect(messageRawBuffer[2]).to.equal(zutil.REQUEST);
      expect(messageRawBuffer[3]).to.equal(0x04);
      expect(messageRawBuffer[4]).to.equal(0xAA);
      expect(messageRawBuffer[5]).to.equal(0xAB);
      expect(messageRawBuffer[6]).to.equal(0xAC);
      expect(messageRawBuffer[7]).to.equal(0xAD);
      expect(messageRawBuffer[8]).to.equal(0x11);
      expect(messageRawBuffer[9]).to.equal(0xE2);

      done();
    });

  test('generateMessageBuffer valid message no data' +
       '\n\tPurpose: Attempt to generate the message buffer valid but there is no data ' +
       '\n\tExpectation: Raw message buffer should be returned',
    function(done) {

      var message = new baseMessage.getInstance(null, 0);
      expect(message).not.equal(null);

      message.mValid = true;
      message.mType = zutil.REQUEST;
      message.mFunctionID = 0x04;
      message.mDataBufferLen = 0;
      message.mDataBuffer = null;

      var messageRawBuffer = message.generateMessageBuffer();

      expect(messageRawBuffer).not.be(Error);
      expect(messageRawBuffer).not.equal(null);
      expect(messageRawBuffer.length).to.equal(5);
      expect(messageRawBuffer[0]).to.equal(zutil.SOF);
      expect(messageRawBuffer[1]).to.equal(3);
      expect(messageRawBuffer[2]).to.equal(zutil.REQUEST);
      expect(messageRawBuffer[3]).to.equal(0x04);
      expect(messageRawBuffer[4]).to.equal(248);

      done();
    });

  test('generateMessageBuffer valid message null data but data len not 0' +
       '\n\tPurpose: Attempt to generate the message buffer valid but data is indicated but the data buffer is null and the data len is not 0 ' +
       '\n\tExpectation: An error should be returned',
    function(done) {

      var message = new baseMessage.getInstance(null, 0);
      expect(message).not.equal(null);

      message.mValid = true;
      message.mType = zutil.REQUEST;
      message.mFunctionID = 0x04;
      message.mDataBufferLen = 3;
      message.mDataBuffer = null;

      var messageRawBuffer = message.generateMessageBuffer();

      expect(messageRawBuffer).to.be.an(Error);
      expect(messageRawBuffer.message).to.be('mDataBuffer null but mDataBufferLen indicates data');

      done();
    });

  test('generateMessageBuffer valid message not null data but data len 0' +
       '\n\tPurpose: Attempt to generate the message buffer that is valid, data buffer is not null and the data len is 0 ' +
       '\n\tExpectation: An error should be returned',
    function(done) {

      var message = new baseMessage.getInstance(null, 0);
      expect(message).not.equal(null);

      message.mValid = true;
      message.mType = zutil.REQUEST;
      message.mFunctionID = 0x04;
      message.mDataBufferLen = 0;
      message.mDataBuffer = new Buffer(3);

      var messageRawBuffer = message.generateMessageBuffer();

      expect(messageRawBuffer).to.be.an(Error);
      expect(messageRawBuffer.message).to.be('mDataBuffer not null but mDataBufferLen indicates 0');

      done();
    });

  test('setData no type' +
       '\n\tPurpose: Pass message info without type' +
       '\n\tExpectation: An error should be returned',
    function(done) {
      var message = new baseMessage.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      var result = message.setData(messageData);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Missing type field');

      done();
    });
  test('setData no functionID' +
       '\n\tPurpose: Pass message info without functionID' +
       '\n\tExpectation: An error should be returned',
    function(done) {
      var message = new baseMessage.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['type'] = 0x00;

      var result = message.setData(messageData);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Missing functionID field');

      done();
    });
  test('setData no data' +
       '\n\tPurpose: Pass message info without data' +
       '\n\tExpectation: An error should be returned',
    function(done) {
      var message = new baseMessage.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;

      var result = message.setData(messageData);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Missing data field');

      done();
    });
  test('setData no dataLen' +
       '\n\tPurpose: Pass message info without dataLen' +
       '\n\tExpectation: An error should be returned',
    function(done) {
      var message = new baseMessage.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      messageData['data'] = new Buffer(10);

      var result = message.setData(messageData);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Missing dataLen field');

      done();
    });
  test('setData invalid type' +
       '\n\tPurpose: Pass message info with invalid type' +
       '\n\tExpectation: An error should be returned',
    function(done) {
      var message = new baseMessage.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['type'] = 0x03;
      messageData['functionID'] = 0x03;
      messageData['data'] = new Buffer(10);
      messageData['dataLen'] = 3;

      var result = message.setData(messageData);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Invalid type');

      done();
    });
  test('setData too big' +
       '\n\tPurpose: Pass message info which results in a message that is too large' +
       '\n\tExpectation: An error should be returned',
    function(done) {
      var message = new baseMessage.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['type'] = 0x00;
      messageData['functionID'] = 0x03;
      messageData['data'] = new Buffer(10);
      messageData['dataLen'] = 255;

      var result = message.setData(messageData);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Message too big');

      done();
    });

  test('setData valid' +
       '\n\tPurpose: Pass message info which results in a message that is valid' +
       '\n\tExpectation: An error should be returned',
    function(done) {
      var message = new baseMessage.getInstance(null, 8);

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
      expect(message.mCS).to.equal(0xF5)

      done();
    });
});