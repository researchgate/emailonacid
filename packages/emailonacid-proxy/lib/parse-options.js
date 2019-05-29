'use strict';

const commander = require('commander');

function getOptions(argv = []) {
  return commander
    .option('-p, --port <port>', 'Port number', parseInt, 8080)
    .option(
      '-r, --requests-per-interval <rpi>',
      'Max requests to make per given interval',
      parseInt,
      60
    )
    .option(
      '-i, --interval <interval>',
      'Time interval to track requests in milliseconds',
      parseInt,
      5 * 60e3
    )
    .option(
      '-d, --destination [url]',
      'Proxy destination',
      'https://api.emailonacid.com/v5'
    )
    .parse(argv);
}

module.exports = getOptions;
