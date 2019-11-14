'use strict';

const { cosmiconfigSync } = require('cosmiconfig');
const explorer = cosmiconfigSync('emailonacid');

function getConfig() {
  const result = explorer.search();
  return result ? result.config : {};
}

module.exports = getConfig;
