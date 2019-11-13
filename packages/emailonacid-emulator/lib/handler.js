'use strict';

const crypto = require('crypto');
const { json, send } = require('micro');
const { getState, setState } = require('./state');
const {
  NotFoundError,
  NotImplementedError,
  InvalidClientError,
  InvalidTestIdError,
  NoSubjectError,
  NoContentError,
} = require('./errors');

const handler = {
  async auth() {
    return { success: true };
  },
  async getClients() {
    return { clients: getState().availableClients };
  },
  async getDefaultClients() {
    return { clients: getState().defaultClients };
  },
  async setDefaultClients(req, res) {
    const availableClients = getState().availableClients;
    const desiredClients = await json(req);
    const unknownClients = desiredClients.filter(
      (client) =>
        !Object.prototype.hasOwnProperty.call(availableClients, client)
    );
    const knownClients = desiredClients.filter((client) =>
      Object.prototype.hasOwnProperty.call(availableClients, client)
    );
    if (unknownClients.length === desiredClients.length) {
      return send(res, 400, new InvalidClientError(unknownClients));
    }
    setState({ defaultClients: knownClients });
    return {
      clients: getState().defaultClients,
      warnings: unknownClients.length
        ? new InvalidClientError(unknownClients).toJSON().error
        : [],
    };
  },
  async getClientTips() {
    return new NotImplementedError();
  },
  async getTests() {
    const tests = getState().tests;
    return Object.keys(tests).map((id) => {
      const test = tests[id];
      return {
        id,
        date: test.date,
        type: test.type,
        subject: test.subject,
      };
    });
  },
  async createTest(req, res) {
    const { availableClients, defaultClients } = getState();
    const { subject, html, url, clients = defaultClients } = await json(req);
    if (!subject) return send(res, 400, new NoSubjectError());
    if (!html && !url) return send(res, 400, new NoContentError());
    const unknownClients = clients.filter(
      (client) =>
        !Object.prototype.hasOwnProperty.call(availableClients, client)
    );
    if (unknownClients.length)
      return send(res, 400, new InvalidClientError(unknownClients));
    const id = crypto
      .randomBytes(Math.ceil(45 / 2))
      .toString('hex')
      .slice(0, -1);
    const test = {
      customer_id: null,
      reference_id: null,
      id,
      subject,
      html,
      url,
      clients,
      type: 'email-test',
      completed: [],
      processing: clients,
      bounced: [],
    };
    setState({
      tests: {
        [test.id]: test,
      },
      results: {
        [test.id]: clients.reduce(
          (out, client) => ({
            ...out,
            [client]: {
              ...getState().availableClients[client],
              status: 'Processing',
              status_details: {
                submitted: Date.now() / 1000,
                attempts: 1,
              },
            },
          }),
          {}
        ),
      },
    });
    return {
      customer_id: test.customer_id,
      reference_id: test.reference_id,
      id: test.id,
    };
  },
  async getTestInfo(req, res) {
    const test = getState().tests[req.params.id];
    if (test) {
      const results = getState().results[test.id];
      const bounced = test.bounced;
      const completed = Object.keys(results);
      const processing = test.clients.filter(
        (client) => !completed.includes(client)
      );
      return {
        subject: test.subject,
        date: test.date,
        completed: completed.length ? completed : undefined,
        processing: processing.length ? processing : undefined,
        bounced: bounced.length ? bounced : undefined,
      };
    }
    return send(res, 404, new InvalidTestIdError());
  },
  async getResults(req, res) {
    if (req.params.client) {
      throw new NotImplementedError();
    }
    const test = getState().tests[req.params.id];
    if (test) {
      return getState().results[test.id];
    }
    return send(res, 404, new InvalidTestIdError());
  },
  async getTestContent(res, req) {
    const test = getState().tests[req.params.id];
    return test
      ? { content: test.content }
      : send(res, 404, new InvalidTestIdError());
  },
  async deleteTest(req, res) {
    const test = getState().tests[req.params.id];
    if (test) {
      const nextTests = getState().tests;
      delete nextTests[test.id];
      setState({ tests: nextTests });
      return { success: true };
    }
    return send(res, 404, new InvalidTestIdError());
  },
  async notFound(req, res) {
    return send(res, 404, new NotFoundError());
  },
};

module.exports = {
  handler,
};

/* eslint camelcase: off */
