'use strict';

const yargs = require('yargs');

function getOptions() {
  return yargs
    .option('p', {
      alias: 'port',
      type: 'number',
      description: 'Port number',
      default: 8080,
    })
    .option('r', {
      alias: 'requests-per-interval',
      type: 'number',
      description: 'Max requests to make per given interval',
      default: 60,
    })
    .option('i', {
      alias: 'interval',
      type: 'number',
      description: 'Time interval to track requests in milliseconds',
      default: 5 * 60e3,
    })
    .option('d', {
      alias: 'destination',
      type: 'string',
      description: 'Proxy destination',
      default: 'https://api.emailonacid.com/v5',
    })
    .demandCommand(0, 0)
    .strict().argv;
}

module.exports = getOptions;
