'use strict';

const url = require('url');
const fetch = require('node-fetch');
const AggregateError = require('aggregate-error');
const resolveConfig = require('./lib/resolve-config');
const git = require('./lib/exec-git');

/**
 * @typedef PullRequest
 * @property id {number}
 * @property version {number}
 * @property title {string}
 * @property description {string}
 * @property state {'OPEN'|'DECLINED'|'MERGED'}
 * @property open {boolean}
 * @property closed {boolean}
 * @property createdDate {number}
 * @property updatedDate {number}
 * @property fromRef {Object}
 * @property toRef {Object}
 * @property locked {boolean}
 * @property author {Object}
 * @property reviewers {Array<Object>}
 * @property participants {Array<Object>}
 * @property properties {Object}
 * @property links {Object}
 */

async function upload() {
  const config = await resolveConfig();
  // Extract remote url
  const remote = new url.URL(await git('remote', 'get-url', 'origin'));
  const [projectKey, repositorySlug] = remote.pathname
    .replace(/\.git$/, '')
    .split('/')
    .filter(Boolean);
  const endpoint = new url.URL(
    [
      'https:/',
      remote.hostname,
      'rest/api/1.0/projects',
      projectKey,
      'repos',
      repositorySlug,
    ].join('/')
  );
  // Push the changes
  if (!config.dryRun) {
    await git('add', '--all');
    await git('commit', '--message', config.message, '--no-verify');
    await git('push', '--force', 'origin', `HEAD:${config.remoteBranch}`);
  }
  // Create PR if doesn't exist
  const fetchApi = async (pathname, options = {}) => {
    const response = await fetch(`${endpoint}/${pathname}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      ...options,
    });
    const payload = await response.json();
    if (response.ok) {
      return payload;
    }
    throw new AggregateError(
      payload.errors.map(({ message, exceptionName }) => {
        const error = new Error();
        error.message = message;
        error.name = exceptionName;
        Error.captureStackTrace(error, fetchApi);
        return error;
      })
    );
  };
  /** @type {{values: Array<PullRequest>}} */
  const { values: pullRequests } = await fetchApi(
    `pull-requests?direction=OUTGOING&at=refs/heads/${config.remoteBranch}`
  );
  const [pullRequest] = pullRequests;
  // Maintain a PR
  if (!config.dryRun) {
    const repository = {
      slug: repositorySlug,
      name: null,
      project: { key: projectKey },
    };
    const body = JSON.stringify({
      title: config.message,
      description: config.description,
      state: 'OPEN',
      open: true,
      closed: false,
      locked: false,
      fromRef: { id: `refs/heads/${config.remoteBranch}`, repository },
      toRef: { id: `refs/heads/${config.targetBranch}`, repository },
      reviewers: config.reviewers.map((name) => ({ user: { name } })),
      ...(pullRequest ? { version: pullRequest.version } : {}),
    });
    // Update existing PR or create a new one
    const result = pullRequest
      ? await fetchApi(`pull-requests/${pullRequest.id}`, {
          method: 'PUT',
          body,
        })
      : await fetchApi('pull-requests', { method: 'POST', body });
    // Return link to a PR
    const [link] = result.links.self;
    return `Pull Request is ready at ${link.href}`;
  }
  return '';
}

module.exports = upload;
