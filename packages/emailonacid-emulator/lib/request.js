'use strict';

const { send, json, text } = require('micro');
const { router } = require('microrouter');
const {
  AccessDeniedError,
  NoContentError,
  InvalidJsonError,
} = require('./errors');

// Validate bearer token
function withToken(token) {
  return (...funcs) => async (req, res) => {
    if (req.headers.authorization) {
      const [, receivedToken] = req.headers.authorization.split(' ');
      const decodedToken = Buffer.from(receivedToken, 'base64').toString(
        'utf8'
      );
      if (decodedToken === token) {
        return await router(...funcs)(req, res);
      }
    }
    return await send(res, 401, new AccessDeniedError());
  };
}

// Ensure there's body payload for POST and PUT requests
function withPayload(...funcs) {
  return async (req, res) => {
    if (['post', 'put'].includes(req.method.toLowerCase())) {
      const payload = await text(req);
      if (payload.length) {
        try {
          const data = await json(req);
          if (!Array.isArray(data) && Object(data) === data) {
            return await router(...funcs)(req, res);
          }
          return await send(res, 400, new InvalidJsonError());
        } catch (reason) {
          return await send(res, 400, new InvalidJsonError());
        }
      }
      return await send(res, 400, new NoContentError());
    }
    return await router(...funcs)(req, res);
  };
}

module.exports = { withToken, withPayload };
