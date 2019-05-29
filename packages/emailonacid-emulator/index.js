'use strict';

const { router, withNamespace, get, post, del } = require('microrouter');
const { withToken, withPayload } = require('./lib/request');
const { handler } = require('./lib/handler');

module.exports = router(
  withPayload(
    withToken('sandbox:sandbox')(
      withNamespace('/v5')(
        get('/auth', handler.auth),
        get('/email/clients', handler.getClients),
        get('/email/clients/default', handler.getDefaultClients),
        post('/email/clients/default', handler.setDefaultClients),
        get('/email/tips/:client', handler.getClientTips),
        get('/email/tests', handler.getTests),
        post('/email/tests', handler.createTest),
        get('/email/tests/:id/results(/:client)', handler.getResults),
        get('/email/tests/:id/content', handler.getTestContent),
        get('/email/tests/:id', handler.getTestInfo),
        del('/email/tests/:id', handler.deleteTest),
        handler.notFound
      )
    )
  )
);
