// @ts-check
'use strict';

const { join, relative } = require('path');
const {
  createEmulator,
  createServer,
} = require('@researchgate/emailonacid-emulator/standalone');
const { configureCreateEmail } = require('../');

jest.unmock('cross-fetch');

describe('polling', () => {
  const emulator = createEmulator();
  const fixtures = createServer();
  const pathToFixture = (resource) => {
    return relative(process.cwd(), join(__dirname, '__fixtures__', resource));
  };

  beforeAll(fixtures.start);
  beforeAll(emulator.start);
  afterEach(emulator.resetState);
  afterEach(jest.resetAllMocks);
  afterAll(emulator.stop);
  afterAll(fixtures.stop);

  it.each(['android6', 'outlook07'])(
    'polls the result: %s',
    async (clientName) => {
      jest.setTimeout(1.5 * 60 * 1000);

      const createEmail = configureCreateEmail({
        credentials: { apiKey: 'sandbox', accountPassword: 'sandbox' },
        clients: [clientName],
        server: emulator.url,
      });
      // Set available clients
      emulator.setState({
        availableClients: {
          [clientName]: { id: clientName },
        },
      });
      const email = await createEmail('');
      // Set desired result
      emulator.setState({
        results: {
          [email.id]: {
            [clientName]: {
              screenshots: {
                default: [
                  fixtures.url,
                  pathToFixture(`polling-polls-the-result-${clientName}.png`),
                ].join('/'),
              },
              status_details: {
                // Simulate EoA's time shift bug
                completed:
                  new Date().setHours(new Date().getHours() + 7) / 1000,
              },
            },
          },
        },
      });
      expect(await email.screenshot(clientName)).toMatchImageSnapshot();
    }
  );
});

/* eslint-env jest */
/* eslint camelcase: off */
