'use strict';

const micro = require('micro');
const parseOptions = require('./lib/parse-options');
const createHandler = require('./lib/create-handler');

async function start() {
  const options = parseOptions();
  const handler = createHandler(options);
  const server = micro(handler);
  server.listen(options.port, () =>
    // eslint-disable-next-line no-console
    console.log('Listening on %s', options.port)
  );
  return server;
}

module.exports = start;
