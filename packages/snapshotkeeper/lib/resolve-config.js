'use strict';

const isCI = require('is-ci');
const { cosmiconfig } = require('cosmiconfig');
const explorer = cosmiconfig('snapshotkeeper');

async function resolveConfig() {
  const result = await explorer.search();
  const defaults = {
    dryRun: !isCI,
    debug: Boolean(process.env.DEBUG),
    token: process.env.STASH_TOKEN,
    message: 'chore: snapshots maintenance',
    description: [
      '🤖 This PR is created and maintained automatically.',
      '🚦 Please review updated snapshots of components you own.',
      '✨ Feel free to merge it if everything looks good.',
    ].join('\n'),
    remoteBranch: 'chore/snapshotkeeper',
    targetBranch:
      process.env.CHANGE_TARGET ||
      process.env.CHANGE_BRANCH ||
      process.env.BRANCH_NAME ||
      process.env.GIT_BRANCH ||
      'master',
    reviewers: [],
  };
  return result ? { ...defaults, ...result.config } : defaults;
}

module.exports = resolveConfig;
