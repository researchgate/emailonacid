'use strict';

const execa = require('execa');
const resolveConfig = require('./resolve-config');

let config;

async function execGit(...args) {
  if (!config) {
    config = await resolveConfig();
  }
  return await execa.stdout(
    'git',
    args,
    config.debug ? { stdio: 'inherit' } : undefined
  );
}

module.exports = execGit;
