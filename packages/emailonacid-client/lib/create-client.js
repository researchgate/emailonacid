'use strict';

const fetch = require('cross-fetch');
const merge = require('lodash.merge');
const invariant = require('invariant');
const camelCaseKeys = require('camelcase-keys');
const snakeCaseKeys = require('snakecase-keys');
const btoa = require('./encode-base64');
const unixToDate = require('./unix-to-date');
const {
  validateFlag,
  validateNonEmptyString,
  validateStringArray,
  validateEnum,
} = require('./validate-options');

function createApiFetcher(baseApiUrl, apiKey, accountPassword) {
  return async function fetchApi(endpoint, userOptions = {}) {
    const authToken = btoa([apiKey, accountPassword].join(':'));
    const baseOptions = {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${authToken}`,
        'Content-Type': 'application/json',
      },
    };
    const options = merge({}, baseOptions, userOptions);
    const targetUrl = [baseApiUrl, endpoint].join('/');
    const response = await fetch(targetUrl, options);
    const data = await response.json();
    if (data.error) {
      throw new Error(
        `[${data.error.name}] ${data.error.message} (${options.method} ${targetUrl})`
      );
    }
    if (response.ok) {
      return camelCaseKeys(data, { deep: true });
    }
    throw new Error(
      `[UnknownError] Request has faild without an error message (${options.method} ${targetUrl}).`
    );
  };
}

function createClient({
  apiKey,
  accountPassword,
  baseApiUrl = 'https://api.emailonacid.com/v5',
  defaultClients = ['iphone6p_9', 'gmail_chr26_win', 'outlook16'],
} = {}) {
  validateNonEmptyString(apiKey, 'apiKey');
  validateNonEmptyString(accountPassword, 'accountPassword');
  validateNonEmptyString(baseApiUrl, 'baseApiUrl');
  validateStringArray(defaultClients);
  // Prepare headers and errors reporting
  const fetchApi = createApiFetcher(baseApiUrl, apiKey, accountPassword);

  return {
    async auth() {
      const { success } = await fetchApi('auth');
      return success;
    },
    async getClients() {
      const { clients } = await fetchApi('email/clients');
      // Normilise object with key mapping to flat array
      return Object.keys(clients).reduce((output, key) => {
        return output.concat(clients[key]);
      }, []);
    },
    async getDefaultClients() {
      const { clients } = await fetchApi('email/clients/default');
      return clients;
    },
    async setDefaultClients(clientIds) {
      validateStringArray(clientIds, 'clientIds');
      const { clients } = await fetchApi('email/clients/default', {
        mthod: 'PUT',
        body: JSON.stringify({ clients: clientIds }),
      });
      return clients;
    },
    async getClientTips(clientId) {
      validateNonEmptyString(clientId, 'clientId');
      const { tips } = await fetchApi(`email/tips/${clientId}`);
      return tips;
    },
    async createTest({
      subject,
      html = undefined,
      url = undefined,
      transferEncoding = '8bit',
      charset = 'utf-8',
      freeTest = false,
      sandbox = false,
      referenceId = undefined,
      customerId = undefined,
      tags = undefined,
      clients = defaultClients,
      imageBlocking = false,
      spam = undefined,
    } = {}) {
      // Validate mandatory options
      validateNonEmptyString(subject, 'subject');
      invariant(html || url, 'Expected either html or url to be provided');
      invariant(
        !(html && url),
        'Expected only one of html or url options to be provided'
      );
      validateEnum(
        transferEncoding,
        ['base64', 'quoted-printable', '7bit', '8bit'],
        'transferEncoding'
      );
      validateNonEmptyString(charset, 'charset');
      validateFlag(freeTest, 'freeTest');
      validateFlag(sandbox, 'sandbox');
      validateStringArray(clients, 'clients');
      validateFlag(imageBlocking, 'imageBlocking');
      // Validate optionals
      if (html) validateNonEmptyString(html, 'html');
      if (url) validateNonEmptyString(url, 'url');
      if (referenceId) validateNonEmptyString(referenceId, 'referenceId');
      if (customerId) validateNonEmptyString(customerId, 'customerId');
      if (tags) validateStringArray(tags, 'tags');
      if (spam)
        invariant(typeof spam === 'object', 'Exptected `spam` to be an object');
      // Send a test creation request
      return await fetchApi('email/tests', {
        method: 'POST',
        body: JSON.stringify(
          snakeCaseKeys(
            {
              subject,
              html,
              url,
              transferEncoding,
              charset,
              freeTest,
              sandbox,
              referenceId,
              customerId,
              tags,
              clients,
              imageBlocking,
              spam,
            },
            { deep: true }
          )
        ),
      });
    },
    async getTests() {
      const tests = await fetchApi('email/tests');
      // Normilize result to make sure headers are always set
      return tests.map((test) =>
        merge({ headers: {} }, test, { date: unixToDate(test.date) })
      );
    },
    async getTest(testId) {
      validateNonEmptyString(testId, 'testId');
      const result = await fetchApi(`email/tests/${testId}`);
      // Normilize result to make sure all props are set
      return merge({ completed: [], processing: [], bounced: [] }, result, {
        date: unixToDate(result.date),
      });
    },
    async getResults(testId) {
      validateNonEmptyString(testId, 'testId');
      const data = await fetchApi(`email/tests/${testId}/results`);
      // Normilise object with key mapping to flat array
      return Object.keys(data).reduce((clients, key) => {
        const client = data[key];
        return clients.concat(
          merge(client, {
            statusDetails: {
              submitted: client.statusDetails.submitted
                ? unixToDate(client.statusDetails.submitted)
                : undefined,
              completed: client.statusDetails.completed
                ? unixToDate(client.statusDetails.completed)
                : undefined,
            },
          })
        );
      }, []);
    },
    async getTestContent(testId) {
      validateNonEmptyString(testId, 'testId');
      const { content } = await fetchApi(`email/tests/${testId}/content`);
      return content;
    },
    async deleteTest(testId) {
      validateNonEmptyString(testId, 'testId');
      const { success } = await fetchApi(`email/tests/${testId}`, {
        method: 'DELETE',
      });
      return success;
    },
  };
}

module.exports = createClient;
