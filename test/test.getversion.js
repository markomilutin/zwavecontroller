'use strict';

const expect = require('expect.js');
const getversion = require('../lib/zwavemessages/getversion.js');
const getversionPrivate = require('../lib/zwavemessages/getversion.js').testingPrivate;
const zutil = require('../lib/zwaveutil.js');

suite('BaseMessage', function() {
  test('Default constructor' +
       '\n\tPurpose: Instantiate object with no raw data' +
       '\n\tExpectation: All member variables should be set to defaults',
    function(done) {
      var message = new getversion.getInstance(null, 0);

      expect(message.mType).to.equal(zutil.REQUEST);
      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_UNDEFINED);
      expect(message.mDataBuffer).to.equal(null);
      expect(message.mDataBufferLen).to.equal(0);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(0);
      expect(message.mValid).to.equal(false);
      expect(message.mControllerVersion).to.equal('');

      done();
    });


  test('Default constructor 2' +
       '\n\tPurpose: Instantiate object with no raw data, but the rawBufferSize is not 0' +
       '\n\tExpectation: All member variables should be set to defaults',
    function(done) {
      var message = new getversion.getInstance(null, 11);

      expect(message.mType).to.equal(zutil.REQUEST);
      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_UNDEFINED);
      expect(message.mDataBuffer).to.equal(null);
      expect(message.mDataBufferLen).to.equal(0);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(0);
      expect(message.mValid).to.equal(false);
      expect(message.mControllerVersion).to.equal('');

      done();
    });

  test('Default constructor 3' +
       '\n\tPurpose: Instantiate object with raw data, but the rawBufferSize is 0' +
       '\n\tExpectation: All member variables should be set to defaults',
    function(done) {
      var testBuffer = new Buffer(10);
      var message = new getversion.getInstance(testBuffer, 4);

      expect(message.mType).to.equal(zutil.REQUEST);
      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_UNDEFINED);
      expect(message.mDataBuffer).to.equal(null);
      expect(message.mDataBufferLen).to.equal(0);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(0);
      expect(message.mValid).to.equal(false);
      expect(message.mControllerVersion).to.equal('');

      done();
    });

  test('Default constructor invalid data' +
       '\n\tPurpose: Pass in buffer size that is less than minimum required' +
       '\n\tExpectation: All member variables should be set to defaults',
    function(done) {
      var testBuffer = new Buffer(10);
      var message = new getversion.getInstance(testBuffer, 4);

      expect(message.mType).to.equal(zutil.REQUEST);
      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_UNDEFINED);
      expect(message.mDataBuffer).to.equal(null);
      expect(message.mDataBufferLen).to.equal(0);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mCS).to.equal(0);
      expect(message.mValid).to.equal(false);
      expect(message.mControllerVersion).to.equal('');

      done();
    });

  test('_parseDataBuffer too small' +
       '\n\tPurpose: Pass in data buffer that is too small' +
       '\n\tExpectation: An Error should be generated',
    function(done) {
      var testBuffer = new Buffer(11);
      var message = new getversion.getInstance(null, 0);

      var result = getversionPrivate._parseDataBuffer.call(message, testBuffer, 11);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('dataBufferSize_ less than minimum');

      done();
    });

  test('_parseDataBuffer too big' +
       '\n\tPurpose: Pass in data buffer that is too small' +
       '\n\tExpectation: An Error should be generated',
    function(done) {
      var testBuffer = new Buffer(14);
      var message = new getversion.getInstance(null, 0);

      var result = getversionPrivate._parseDataBuffer.call(message, testBuffer, 14);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('unexpected data');

      done();
    });

  test('_parseDataBuffer version no callbackID' +
       '\n\tPurpose: Pass in data buffer that contains just the version' +
       '\n\tExpectation: The message should be valid and the controller version should be set',
    function(done) {
      var testBuffer = new Buffer(12);
      var message = new getversion.getInstance(null, 0);

      testBuffer[0] = 0x31;
      testBuffer[1] = 0x32;
      testBuffer[2] = 0x33;
      testBuffer[3] = 0x34;
      testBuffer[4] = 0x20;
      testBuffer[5] = 0x39;
      testBuffer[6] = 0x39;
      testBuffer[7] = 0x39;
      testBuffer[8] = 0x39;
      testBuffer[9] = 0x39;
      testBuffer[10] = 0x39;
      testBuffer[11] = 0x39;

      var result = getversionPrivate._parseDataBuffer.call(message, testBuffer, 12);

      expect(result).to.equal(true);
      expect(message.mValid).to.equal(true);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mControllerVersion).to.equal('1234 9999999');

      done();
    });

  test('_parseDataBuffer version with callbackID' +
       '\n\tPurpose: Pass in data buffer that contains version and callback ID' +
       '\n\tExpectation: The message should be valid, the controller version should be set and the callback ID should be set',
    function(done) {
      var testBuffer = new Buffer(13);
      var message = new getversion.getInstance(null, 0);

      testBuffer[0] = 0x31;
      testBuffer[1] = 0x32;
      testBuffer[2] = 0x33;
      testBuffer[3] = 0x34;
      testBuffer[4] = 0x20;
      testBuffer[5] = 0x39;
      testBuffer[6] = 0x39;
      testBuffer[7] = 0x39;
      testBuffer[8] = 0x39;
      testBuffer[9] = 0x39;
      testBuffer[10] = 0x39;
      testBuffer[11] = 0x39;
      testBuffer[12] = 0xAB;

      var result = getversionPrivate._parseDataBuffer.call(message, testBuffer, 13);

      expect(result).to.equal(true);
      expect(message.mValid).to.equal(true);
      expect(message.mCallbackID).to.equal(0xAB);
      expect(message.mControllerVersion).to.equal('1234 9999999');

      done();
    });

  test('Default Constructor data in message invalid' +
       '\n\tPurpose: Pass in buffer which contains valid message but not enough data to satisfy GetVersion message' +
       '\n\tExpectation: The message should not be valid and the controller version should not be set',
    function(done) {
      var testBuffer = new Buffer(10);

      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 6;
      testBuffer[2] = zutil.RESPONSE;
      testBuffer[3] = zutil.FUNC_ID_ZW_GET_VERSION;
      testBuffer[4] = 0x01;
      testBuffer[5] = 0x02;
      testBuffer[6] = 0x03;
      testBuffer[7] = zutil.calcCS(testBuffer.slice(1,7), 6); // CS

      var message = new getversion.getInstance(testBuffer, 8);

      expect(message).not.equal(null);

      expect(message.mValid).to.be(false);

      expect(message.mType).to.equal(zutil.RESPONSE);
      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_ZW_GET_VERSION);
      expect(message.mDataBuffer).not.equal(null);
      expect(message.mDataBufferLen).to.equal(3);
      expect(message.mDataBuffer[0]).to.equal(1);
      expect(message.mDataBuffer[1]).to.equal(2);
      expect(message.mDataBuffer[2]).to.equal(3);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mControllerVersion).to.equal('');
      expect(message.mCS).to.equal(testBuffer[7]);

      done();
    });

  test('Default Constructor data in message valid' +
       '\n\tPurpose: Pass in buffer which contains valid GetVersion message' +
       '\n\tExpectation: The message should be valid and the controller version should be set',
    function(done) {
      var testBuffer = new Buffer(20);

      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 15;
      testBuffer[2] = zutil.RESPONSE;
      testBuffer[3] = zutil.FUNC_ID_ZW_GET_VERSION;
      testBuffer[4] = 0x31;
      testBuffer[5] = 0x31;
      testBuffer[6] = 0x31;
      testBuffer[7] = 0x31;
      testBuffer[8] = 0x31;
      testBuffer[9] = 0x31;
      testBuffer[10] = 0x31;
      testBuffer[11] = 0x31;
      testBuffer[12] = 0x31;
      testBuffer[13] = 0x31;
      testBuffer[14] = 0x31;
      testBuffer[15] = 0x31;
      testBuffer[16] = zutil.calcCS(testBuffer.slice(1,16), 15); // CS

      var message = new getversion.getInstance(testBuffer, 17);

      expect(message).not.equal(null);

      expect(message.mValid).to.be(true);

      expect(message.mType).to.equal(zutil.RESPONSE);
      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_ZW_GET_VERSION);
      expect(message.mDataBuffer).not.equal(null);
      expect(message.mDataBufferLen).to.equal(12);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(message.mControllerVersion).to.equal('111111111111');
      expect(message.mCS).to.equal(testBuffer[16]);

      done();
    });

  test('getData empty message' +
       '\n\tPurpose: Create object with no initialization data and call function' +
       '\n\tExpectation: Association array should be returned with default data',
    function(done) {
      var message = new getversion.getInstance(null, 0);

      var messageData = message.getData();

      expect(messageData).not.equal(null);
      expect(messageData['type']).to.equal(zutil.REQUEST);
      expect(messageData['functionID']).to.equal(zutil.FUNC_ID_UNDEFINED);
      expect(messageData['data']).to.equal(null);
      expect(messageData['dataLen']).to.equal(0);
      expect(messageData['callbackID']).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(messageData['cs']).to.equal(0);
      expect(messageData['valid']).to.equal(false);
      expect(messageData['controllerVersion']).to.equal('');

      done();
    });

  test('getData valid message' +
       '\n\tPurpose: Create object with a valid message raw buffer and call function' +
       '\n\tExpectation: Association array should be returned with correct data',
    function(done) {
      var testBuffer = new Buffer(20);

      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 15;
      testBuffer[2] = zutil.RESPONSE;
      testBuffer[3] = zutil.FUNC_ID_ZW_GET_VERSION;
      testBuffer[4] = 0x31;
      testBuffer[5] = 0x31;
      testBuffer[6] = 0x31;
      testBuffer[7] = 0x31;
      testBuffer[8] = 0x31;
      testBuffer[9] = 0x31;
      testBuffer[10] = 0x31;
      testBuffer[11] = 0x31;
      testBuffer[12] = 0x31;
      testBuffer[13] = 0x31;
      testBuffer[14] = 0x31;
      testBuffer[15] = 0x31;
      testBuffer[16] = zutil.calcCS(testBuffer.slice(1,16), 15); // CS

      var message = new getversion.getInstance(testBuffer, 17);

      expect(message).not.equal(null);

      var messageData = message.getData();

      expect(messageData).not.equal(null);
      expect(messageData['type']).to.equal(zutil.RESPONSE);
      expect(messageData['functionID']).to.equal(zutil.FUNC_ID_ZW_GET_VERSION);
      expect(messageData['data']).not.equal(null);
      expect(messageData['dataLen']).to.equal(12);
      expect(messageData['callbackID']).to.equal(zutil.INVALID_CALLBACK_ID);
      expect(messageData['cs']).to.equal(testBuffer[16]);
      expect(messageData['valid']).to.equal(true);
      expect(message.mControllerVersion).to.equal('111111111111');

      done();
    });

  test('setData no controller version response' +
       '\n\tPurpose: Pass in response message info without controllerVersion' +
       '\n\tExpectation: An error should be returned',
    function(done) {
      var message = new getversion.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['type'] = zutil.RESPONSE;
      var result = message.setData(messageData);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Missing controllerVersion field');

      done();
    });

  test('setData version too long response' +
       '\n\tPurpose: Pass in messge info where the controller version Buffer is too long ' +
       '\n\tExpectation: An error should be returned',
    function(done) {
      var message = new getversion.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['type'] = zutil.RESPONSE;
      messageData['controllerVersion'] = new Buffer(13);

      var result = message.setData(messageData);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Invalid controllerVersion field');

      done();
    });


  test('setData valid response' +
       '\n\tPurpose: Pass message info which results in a message that is valid with no callbackID' +
       '\n\tExpectation: The mDataBuffer should be set and the mDataBufferLen should be 12 and the function ID should be FUNC_ID_ZW_GET_VERSION',
    function(done) {
      var message = new getversion.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['type'] = zutil.RESPONSE;
      messageData['functionID'] = 0xFF; //Pass in wrong ID, should be overwritten
      var data  = new Buffer(12);
      messageData['controllerVersion'] = data;
      data[0] = 0x31;
      data[1] = 0x32;
      data[2] = 0x33;
      data[3] = 0x34;
      data[4] = 0x35;
      data[5] = 0x31;
      data[6] = 0x32;
      data[7] = 0x33;
      data[8] = 0x34;
      data[9] = 0x53;
      data[10] = 0x34;
      data[11] = 0x35;

      var result = message.setData(messageData);

      expect(result).to.equal(true);

      expect(message.mDataBuffer[0]).to.equal(0x31);
      expect(message.mDataBuffer[1]).to.equal(0x32);
      expect(message.mDataBuffer[2]).to.equal(0x33);
      expect(message.mDataBuffer[3]).to.equal(0x34);
      expect(message.mDataBuffer[4]).to.equal(0x35);
      expect(message.mDataBuffer[5]).to.equal(0x31);
      expect(message.mDataBuffer[6]).to.equal(0x32);
      expect(message.mDataBuffer[7]).to.equal(0x33);
      expect(message.mDataBuffer[8]).to.equal(0x34);
      expect(message.mDataBuffer[9]).to.equal(0x53);
      expect(message.mDataBuffer[10]).to.equal(0x34);
      expect(message.mDataBuffer[11]).to.equal(0x35);

      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_ZW_GET_VERSION);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);

      done();
    });

  test('setData valid with callbackID' +
       '\n\tPurpose: Pass message info which results in a message that is valid with callbackID' +
       '\n\tExpectation: The mDataBuffer should be set and the mDataBufferLen should be 12 and the function ID should be FUNC_ID_ZW_GET_VERSION',
    function(done) {
      var message = new getversion.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['callbackID'] = 0xAA;
      messageData['type'] = zutil.RESPONSE;
      messageData['functionID'] = 0xFF; //Pass in wrong ID, should be overwritten
      var data  = new Buffer(12);
      messageData['controllerVersion'] = data;
      data[0] = 0x31;
      data[1] = 0x32;
      data[2] = 0x33;
      data[3] = 0x34;
      data[4] = 0x35;
      data[5] = 0x31;
      data[6] = 0x32;
      data[7] = 0x33;
      data[8] = 0x34;
      data[9] = 0x53;
      data[10] = 0x34;
      data[11] = 0x35;

      var result = message.setData(messageData);

      expect(result).to.equal(true);

      expect(message.mDataBuffer[0]).to.equal(0x31);
      expect(message.mDataBuffer[1]).to.equal(0x32);
      expect(message.mDataBuffer[2]).to.equal(0x33);
      expect(message.mDataBuffer[3]).to.equal(0x34);
      expect(message.mDataBuffer[4]).to.equal(0x35);
      expect(message.mDataBuffer[5]).to.equal(0x31);
      expect(message.mDataBuffer[6]).to.equal(0x32);
      expect(message.mDataBuffer[7]).to.equal(0x33);
      expect(message.mDataBuffer[8]).to.equal(0x34);
      expect(message.mDataBuffer[9]).to.equal(0x53);
      expect(message.mDataBuffer[10]).to.equal(0x34);
      expect(message.mDataBuffer[11]).to.equal(0x35);

      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_ZW_GET_VERSION);
      expect(message.mCallbackID).to.equal(0xAA);

      done();
    });

  test('setData valid request' +
       '\n\tPurpose: Pass message info for request with no callbackID' +
       '\n\tExpectation: The mDataBuffer should be null, the mDataBufferLen should be 0 and the function ID should be FUNC_ID_ZW_GET_VERSION',
    function(done) {
      var message = new getversion.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['type'] = zutil.REQUEST;
      messageData['functionID'] = 0xFF; //Pass in wrong ID, should be overwritten

      var result = message.setData(messageData);

      expect(result).to.equal(true);

      expect(message.mDataBuffer).to.equal(null);

      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_ZW_GET_VERSION);
      expect(message.mCallbackID).to.equal(zutil.INVALID_CALLBACK_ID);

      done();
    });

  test('setData valid request with callbackID' +
       '\n\tPurpose: Pass message info which results in request message that is valid with callbackID' +
       '\n\tExpectation: The mDataBuffer should be null, the mDataBufferLen should be 0 and the function ID should be FUNC_ID_ZW_GET_VERSION',
    function(done) {
      var message = new getversion.getInstance(null, 8);

      expect(message).not.equal(null);

      var messageData = [];
      messageData['callbackID'] = 0xAA;
      messageData['type'] = zutil.REQUEST;
      messageData['functionID'] = 0xFF; //Pass in wrong ID, should be overwritten

      var result = message.setData(messageData);

      expect(result).to.equal(true);

      expect(message.mDataBuffer).to.equal(null);

      expect(message.mFunctionID).to.equal(zutil.FUNC_ID_ZW_GET_VERSION);
      expect(message.mCallbackID).to.equal(0xAA);

      done();
    });

});