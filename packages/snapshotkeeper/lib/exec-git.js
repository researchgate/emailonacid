'use strict';

const execa = require('execa');
const resolveConfig = require('./resolve-config');

let config;

async function execGit(...args) {
  if (!config) {
    // eslint-disable-next-line require-atomic-updates
    config = await resolveConfig();
  }
  return (
    await execa('git', args, config.debug ? { stdio: 'inherit' } : undefined)
  ).stdout;
}

module.exports = execGit;
