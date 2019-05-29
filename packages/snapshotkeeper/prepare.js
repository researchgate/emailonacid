'use strict';

const git = require('./lib/exec-git');

async function prepare() {
  // Make sure working directory is clean
  await git('stash');
  return 'Prepare to update snapshots';
}

module.exports = prepare;
