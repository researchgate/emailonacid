'use strict';

const SDC = require('hot-shots');

const compose = (...fns) => {
  return fns.reduce(
    (prev, next) => (...args) => next(prev(...args)),
    (value) => value
  );
};

/**
 * Patches Signale logger to intercept timings
 */
function StatsdReporterPlugin({
  host = process.env.EOA_STATSD_HOST,
  port = process.env.EOA_STATSD_PORT,
  prefix = process.env.EOA_STATSD_PREFIX,
  protocol = undefined,
} = {}) {
  return {
    name: 'StatsdReporterPlugin',
    async prepare({ logger, options }) {
      const statsd = new SDC({ host, port, prefix, protocol });
      // eslint-disable-next-line no-underscore-dangle
      const getTiming = (label) => Date.now() - logger._timers.get(label);
      // Intercept issues
      logger.error = compose((errorOrMessage) => {
        const message =
          errorOrMessage instanceof Error
            ? errorOrMessage.message
            : errorOrMessage;
        switch (true) {
          // Collect outage count
          case /Skipping unknown or temporarily unavailable clients/.test(
            message
          ): {
            errorOrMessage.clients.forEach((clientId) =>
              statsd.increment(`${clientId}.tests_outage_count`)
            );
            break;
          }
          case /Polling timeout/.test(message): {
            errorOrMessage.clients.forEach((clientId) =>
              statsd.increment(`${clientId}.tests_timeout_count`)
            );
            break;
          }
          default:
            break;
        }
        return errorOrMessage;
      }, logger.error.bind(logger));
      // Intercept timings
      logger.timeEnd = compose((label) => {
        const [name, ...payload] = label.split(/:/g);
        const [client] = payload;
        switch (name) {
          // Count tests created
          case 'create':
            options.clients.forEach((clientId) =>
              statsd.increment(`${clientId}.tests_total_count`)
            );
            break;
          // Collect processing time on EoA side
          case 'response':
            statsd.timing(`${client}.duration_eoa`, getTiming(label));
            break;
          // Collect total duration including conversion
          case 'screenshot':
            statsd.timing(`${client}.duration_total`, getTiming(label));
            break;
          default:
            break;
        }
        return label;
      }, logger.timeEnd.bind(logger));
    },
  };
}

module.exports = StatsdReporterPlugin;
