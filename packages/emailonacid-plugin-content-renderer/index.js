'use strict';

const invariant = require('invariant');

/**
 * Renders mail content to a string
 */
function ContentRendererPlugin({ render = String } = {}) {
  return {
    name: 'ContentRendererPlugin',
    async prepare({ email, logger }) {
      logger.debug('preparing to render content');
      invariant(
        typeof render === 'function',
        `Expected renderer to be a function, received ${typeof render} instead`
      );
      // eslint-disable-next-line require-atomic-updates
      email.content = await render(email.content);
      invariant(
        typeof email.content === 'string',
        `Expected rendered email to be a string, received ${typeof email.content} instead`
      );
      logger.debug('successfully rendered content to static markup');
    },
  };
}

module.exports = ContentRendererPlugin;
