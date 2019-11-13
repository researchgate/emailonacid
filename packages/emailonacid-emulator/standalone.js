'use strict';

const micro = require('micro');
const getPort = require('get-port');
const serveHandler = require('serve-handler');
const apiHandler = require('.');
const state = require('./lib/state');

function createServer(handler = serveHandler, prefix = '') {
  /** @type {import('https').Server} */
  let server;

  async function start(options = {}) {
    server = micro(handler);
    const port = options.port || (await getPort());
    await new Promise((resolve) => server.listen(port, resolve));
  }

  async function stop() {
    server.close();
    await new Promise((resolve) => server.once('close', resolve));
    // eslint-disable-next-line require-atomic-updates
    server = undefined;
  }

  return {
    ...state,
    handler,
    start,
    stop,
    get url() {
      return server
        ? `http://localhost:${server.address().port}/${prefix}`
        : null;
    },
  };
}

function createEmulator() {
  return createServer(apiHandler, 'v5');
}

module.exports = {
  createEmulator,
  createServer,
};
