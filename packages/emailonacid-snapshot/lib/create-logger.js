'use strict';

const { Signale } = require('signale');
const types = require('signale/types');

function createLogger(options) {
  return new Signale({
    config: {
      displayTimestamp: false,
      underlineMessage: false,
      displayLabel: false,
    },
    scope: 'emailonacid',
    interactive: false,
    types: {
      ...types,
      debug: {
        ...types.note,
        label: 'debug',
        stream: options.debug ? [process.stdout] : [],
      },
    },
  });
}

module.exports = createLogger;
