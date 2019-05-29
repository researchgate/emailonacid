'use strict';

const invariant = require('invariant');

const validateFlag = (value, label = 'value') => {
  invariant(typeof value === 'boolean', `Exptected ${label} to be boolean`);
};

const validateNonEmptyString = (value, label) => {
  invariant(
    typeof value === 'string' && value.length,
    `Expected ${label} to be non-empty string`
  );
};

const validateStringArray = (value, label) => {
  invariant(
    value.every((item) => typeof item === 'string'),
    `Expected ${label} to be an array of strings`
  );
};

const validateEnum = (value, whitelist, label) => {
  invariant(
    whitelist.indexOf(value),
    `Expected ${label} to be one of ${whitelist.join(', ')}`
  );
};

module.exports = {
  validateFlag,
  validateNonEmptyString,
  validateStringArray,
  validateEnum,
};
