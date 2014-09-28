'use strict';

const expect = require('expect.js');
const zwaveutil = require('../lib/zwaveutil.js');
const calcCS = zwaveutil.calcCS;
const isChecksumValid = zwaveutil.isChecksumValid;


suite('calcCS', function() {
  test('Basic Test' +
       '\n\tPurpose: Pass in a Buffer object of size 1' +
       '\n\tExpectation: Checksum should equal the buffer value XORed with 0xFF',
    function(done) {
      var testBuffer = new Buffer(1);
      testBuffer[0] = 0x01;

      var result = calcCS(testBuffer, 1);
      expect(result).to.be.an('number');
      expect(result).to.be(0xFE);

      done();
    });
  test('Longer Buffer Test' +
       '\n\tPurpose: Pass in a Buffer object of size 10' +
       '\n\tExpectation: Checksum should be the result of XORing all buffer values with 0xFF',
    function(done) {
      var testBuffer = new Buffer(10);
      testBuffer[0] = 0x01;
      testBuffer[1] = 0xAA;
      testBuffer[2] = 0x22;
      testBuffer[3] = 0x33;
      testBuffer[4] = 0x44;
      testBuffer[5] = 0x55;
      testBuffer[6] = 0x66;
      testBuffer[7] = 0x77;
      testBuffer[8] = 0x88;
      testBuffer[9] = 0xBB;


      var result = calcCS(testBuffer, 10);
      expect(result).to.be.an('number');
      expect(result).to.be(118);

      done();
    });

  test('Buffer length smaller than buffer' +
       '\n\tPurpose: Pass in a Buffer object of size 1 when the Buffer is actuall size 2' +
       '\n\tExpectation: Checksum should be the result of XORing the first array entry with 0xFF',
    function(done) {
      var testBuffer = new Buffer(2);
      testBuffer[0] = 0x01;
      testBuffer[1] = 0x32;

      var result = calcCS(testBuffer, 1);
      expect(result).to.be.an('number');
      expect(result).to.be(0xFE);

      done();
    });

  test('Buffer length too long' +
       '\n\tPurpose: Pass in a bufferLen_ which is greater than the actual size of buffer_' +
       '\n\tExpectation: An error should be passed back',
    function(done) {
      var testBuffer = new Buffer(1);
      testBuffer[0] = 0x01;

      var result = calcCS(testBuffer, 3);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Buffer length specified is bigger than actual buffer');

      done();
    });

});

suite('isChecksumValid', function() {
  test('Buffer length too long' +
       '\n\tPurpose: Pass in a buffer length that is too long ' +
       '\n\tExpectation: Error should be returned',
    function(done) {
      var testBuffer = new Buffer(1);
      testBuffer[0] = 0x01;

      var result = isChecksumValid(testBuffer, 3);

      expect(result).to.be.an(Error);
      expect(result.message).to.be('Buffer length specified is bigger than actual buffer');

      done();
    });
  test('Buffer length too small' +
       '\n\tPurpose: Pass in a buffer length that is less than the minimum required size' +
       '\n\tExpectation: Error should be returned',
    function(done) {
      var testBuffer = new Buffer(10);

      var result = isChecksumValid(testBuffer, 2);
      expect(result).to.be.an(Error);
      expect(result.message).to.be('Message smaller than minimum size');

      done();
    });
  test('Basic test' +
      '\n\tPurpose: Pass in a small buffer which represents a message with a valid checksum' +
      '\n\tExpecatation: true should be returned',
    function(done) {
      var testBuffer = new Buffer(10);

      testBuffer[0] = zwaveutil.SOF;
      testBuffer[1] = 0x03;
      testBuffer[2] = 0x00;
      testBuffer[3] = 0xAA;
      testBuffer[4] = 0x02;
      testBuffer[5] = 0x54;

      var result = isChecksumValid(testBuffer, 6);
      expect(result).to.be(true);
      done();
    });
  test('Invalid CS' +
      '\n\tPurpose: Pass in a small buffer which represents a message with an invalid checksum' +
      '\n\tExpecatation: false should be returned',
    function(done) {
      var testBuffer = new Buffer(10);

      testBuffer[0] = zwaveutil.SOF;
      testBuffer[1] = 0x03;
      testBuffer[2] = 0x00;
      testBuffer[3] = 0xAA;
      testBuffer[4] = 0x02;
      testBuffer[5] = 0x11;

      var result = isChecksumValid(testBuffer, 6);
      expect(result).to.be(false);
      done();
    });

});
