'use strict';

const shortid = require('shortid');

/**
 * Prevents threaded view on some clients for better result consistency
 */
function ThreadBustingPlugin({ generateHash = shortid.generate } = {}) {
  return {
    name: 'ThreadBustingPlugin',
    async prepare({ email, logger }) {
      logger.debug('prepending hash to subject to prevent threaded view');
      email.subject = `${email.subject} (${generateHash()})`;
    },
  };
}

module.exports = ThreadBustingPlugin;
