// @ts-check
/* eslint-env jest */
'use strict';

const { createEmulator } = require('emailonacid-emulator/standalone');
const { configureCreateEmail } = require('../');

jest.unmock('cross-fetch');

describe('validation', () => {
  const emulator = createEmulator();

  beforeAll(emulator.start);
  afterEach(emulator.resetState);
  afterEach(jest.resetAllMocks);
  afterAll(emulator.stop);

  it('validates auth token', async () => {
    const createEmail = configureCreateEmail({
      server: emulator.url,
      credentials: { apiKey: 'invalid', accountPassword: 'invalid' },
    });
    await expect(createEmail('')).rejects.toMatchObject({
      message: expect.stringMatching(
        /\[AccessDenied\] Invalid API key or password/
      ),
    });
  });

  it('ensures that desired clients are available', async () => {
    emulator.setState({
      availableClients: {
        foo: { id: 'foo' },
        bar: { id: 'bar' },
      },
    });
    const createEmail = configureCreateEmail({
      server: emulator.url,
      credentials: { apiKey: 'sandbox', accountPassword: 'sandbox' },
      clients: ['baz'],
    });
    await expect(createEmail('')).rejects.toMatchObject({
      message: expect.stringMatching(
        /\[InvalidClient\] A client ID you have requested baz could not be found/
      ),
    });
  });
});
