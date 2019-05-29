'use strict';

function encodeBase64(input) {
  if (global.btoa) {
    return global.btoa(input);
  }
  if (Buffer.byteLength(input) !== input.length) {
    throw new Error('Invalid input, make sure decoded value is a string');
  }
  return Buffer.from(input, 'binary').toString('base64');
}

module.exports = encodeBase64;
