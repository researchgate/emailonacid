'use strict';

const cosmiconfig = require('cosmiconfig');
const explorer = cosmiconfig('emailonacid');

function getConfig() {
  const result = explorer.searchSync();
  return result ? result.config : {};
}

module.exports = getConfig;
