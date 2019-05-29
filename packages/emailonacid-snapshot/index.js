'use strict';

const configureCreateEmail = require('./lib/create-email');

module.exports = {
  createEmail: configureCreateEmail(),
  configureCreateEmail,
};
