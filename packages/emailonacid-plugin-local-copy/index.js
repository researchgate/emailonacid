'use strict';

const { promisify } = require('util');
const execa = require('execa');
const createEmailSender = require('sendmail');
const sendEmailAsync = promisify(createEmailSender({ silent: true }));

/**
 * Sends a local copy of tested mail to a current user's Git email
 */
function LocalCopyPlugin({
  sender = '"Email on Acid Test" <noreply@example.com>',
  recipient = '<currentGitUser>',
} = {}) {
  return {
    name: 'LocalCopyPlugin',
    async prepare({ email, logger }) {
      logger.debug('preparing to send local copy');
      const execOptions = { encoding: 'utf8', cwd: process.cwd() };
      const currentGitUserEmail = (
        await execa('git', ['config', 'user.email'], execOptions)
      ).stdout;
      const compiledRecipient = recipient.replace(
        /<currentGitUser>/g,
        currentGitUserEmail
      );
      try {
        await sendEmailAsync({
          from: sender,
          to: compiledRecipient,
          subject: email.subject,
          html: email.content,
        });
        logger.debug(
          'sent local copy to %s from %s',
          compiledRecipient,
          sender
        );
      } catch (reason) {
        logger.error('failed to send local copy');
        throw reason;
      }
    },
  };
}

module.exports = LocalCopyPlugin;
