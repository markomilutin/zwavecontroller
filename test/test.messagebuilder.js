'use strict';

const expect = require('expect.js');
const zutil = require('../lib/zwaveutil.js');
const messageBuilder = require('../lib/messagebuilder.js').MessageBuilder;
const ACK = require('../lib/zwavemessages/ack.js');
const NACK = require('../lib/zwavemessages/nack.js');
const winston = require('winston');
const getVersion = require('../lib/zwavemessages/getversion.js');

//Disable logging to console
winston.remove(winston.transports.Console);

suite('CreateACK', function() {
  test('CreateTest' +
       '\n\tPurpose: Attempt to create ACK message' +
       '\n\tExpectation: Message returned should be an ACK message',
    function(done) {
      var message = messageBuilder.CreateACK();

      expect(message).to.be.an(ACK.ACK);
      done();
    });
});

suite('CreateNACK', function() {
  test('CreateTest' +
       '\n\tPurpose: Attempt to create NACK message' +
       '\n\tExpectation: Message returned should be an NACK message',
    function(done) {
      var message = messageBuilder.CreateNACK();

      expect(message).to.be.an(NACK.NACK);
      done();
    });
});

suite('GetMessage', function() {
  test('Pass in invalid data' +
       '\n\tPurpose: Call function with null rawData_' +
       '\n\tExpectation: null should be returned',
    function(done) {

      var message = messageBuilder.GetMessage(null, 10);

      expect(message).to.be(null);
      done();
    });
});

suite('GetMessage', function() {
  test('Pass in buffer too small' +
       '\n\tPurpose: Pass in valid data buffer but the size is too small' +
       '\n\tExpectation: null should be returned',
    function(done) {

      var data = new Buffer(10);
      var message = messageBuilder.GetMessage(data, 0);

      expect(message).to.be(null);
      done();
    });
  test('Invalid GetVersion' +
       '\n\tPurpose: Call function with invalid raw data for a GetVersion message' +
       '\n\tExpectation: null should be returned',
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

      var message = messageBuilder.GetMessage(testBuffer, 8);

      expect(message).to.be(null);
      done();
    });
  test('Valid GetVersion' +
       '\n\tPurpose: Call function with valid raw data for a GetVersion message' +
       '\n\tExpectation: A GetVersion message object should be returned',
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

      var message = messageBuilder.GetMessage(testBuffer, 17);

      expect(message).to.be.an(getVersion.GetVersion);
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

  test('Invalid function ID' +
       '\n\tPurpose: Call function with invalid function ID' +
       '\n\tExpectation: null should be returned',
    function(done) {

      var testBuffer = new Buffer(10);

      testBuffer[0] = zutil.SOF;
      testBuffer[1] = 6;
      testBuffer[2] = zutil.RESPONSE;
      testBuffer[3] = zutil.FUNC_ID_UNDEFINED;
      testBuffer[4] = 0x01;
      testBuffer[5] = 0x02;
      testBuffer[6] = 0x03;
      testBuffer[7] = zutil.calcCS(testBuffer.slice(1,7), 6); // CS

      var message = messageBuilder.GetMessage(testBuffer, 8);

      expect(message).to.be(null);
      done();
    });

});
