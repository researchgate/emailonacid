/* eslint no-console: off, node/no-deprecated-api: off */
'use strict';

const { resolve, URL } = require('url');
const { RateLimit: createRateLimit } = require('async-sema');
const fetch = require('cross-fetch');

function createHandler(options) {
  const limit = createRateLimit(options.requestsPerInterval, {
    timeUnit: options.interval,
  });

  /** @type {import('micro').RequestHandler} */
  return async (req, res) => {
    // Add basic healthcheck for a deployment
    if (req.url === '/') {
      res.write(JSON.stringify({ status: 'ready', version: '/v5' }));
      res.end();
      return;
    }
    await limit();
    const requestedUrl = new URL(resolve(options.destination, req.url));
    const url = new URL(
      resolve(options.destination, requestedUrl.pathname + requestedUrl.search)
    );
    const proxyRes = await fetch(url, {
      method: req.method,
      headers: {
        'x-forwarded-host': req.headers.host,
        ...req.headers,
        host: url.host,
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      compress: false,
      redirect: 'manual',
    });
    // Forward status code
    res.statusCode = proxyRes.status;
    // Forward headers
    const headers = proxyRes.headers.raw();
    for (const name of Object.keys(headers)) {
      res.setHeader(name, headers[name]);
    }
    // Stream the proxy response
    proxyRes.body.pipe(res);
    proxyRes.body.on('error', (err) => {
      console.error(`Error on proxying url: ${url}`);
      console.error(err.stack);
      res.end();
    });
    req.on('abort', () => {
      proxyRes.body.destroy();
    });
  };
}

module.exports = createHandler;
