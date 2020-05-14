'use strict';

const { withOverridableClients, withDefaultPlugins } = require('./config');

function getConfigDefaults() {
  return withDefaultPlugins(
    withOverridableClients({
      clients: ['iphone6p_9', 'gmail_chr26_win', 'outlook16'],
      credentials: {
        apiKey: process.env.EOA_API_KEY,
        accountPassword: process.env.EOA_ACCOUNT_PASSWORD,
      },
      debug: Boolean(process.env.DEBUG) || Boolean(process.env.EOA_DEBUG),
      plugins: [],
      server: process.env.EOA_SERVER_ADDRESS,
      poll: { interval: 5e3, timeout: 120e3 },
      retry: false,
    })
  );
}

module.exports = getConfigDefaults;
