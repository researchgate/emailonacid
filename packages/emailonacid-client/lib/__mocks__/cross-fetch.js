/* eslint-env jest */
'use strict';

let respond;

const fetch = jest.fn(async (url, options) => {
  return {
    ok: true,
    json: async () =>
      respond(url, options.body ? JSON.parse(options.body) : undefined),
  };
});

fetch.mockResponse = (map) => {
  respond = (url, body) =>
    url in map
      ? Promise.resolve(map[url](body))
      : Promise.reject(`fetch() mock called with unexpected url ${url}`);
};

fetch.mockSuccessResponse = () => {
  respond = () => ({ success: true });
};

fetch.mockSuccessResponse();

module.exports = fetch;
