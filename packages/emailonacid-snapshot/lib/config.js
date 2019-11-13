'use strict';

const ThreadBustingPlugin = require('@researchgate/emailonacid-plugin-thread-busting');
const ContentRendererPlugin = require('@researchgate/emailonacid-plugin-content-renderer');
const LocalCopyPlugin = require('@researchgate/emailonacid-plugin-local-copy');
const ContentCroppingPlugin = require('@researchgate/emailonacid-plugin-content-cropping');

function withOverridableClients(config = {}) {
  return Object.assign({}, config, {
    clients: process.env.EOA_CLIENTS
      ? process.env.EOA_CLIENTS.split(/\s{0,},\s{0,}/m)
      : config.clients,
  });
}

function withDefaultPlugins(config = {}) {
  const userPlugins = config.plugins || [];
  return Object.assign({}, config, {
    plugins: userPlugins
      .concat([
        new ThreadBustingPlugin(),
        new ContentRendererPlugin(),
        Boolean(process.env.EOA_SEND_COPY) && new LocalCopyPlugin(),
        new ContentCroppingPlugin(),
      ])
      .filter(Boolean),
  });
}

module.exports = {
  withOverridableClients,
  withDefaultPlugins,
};
