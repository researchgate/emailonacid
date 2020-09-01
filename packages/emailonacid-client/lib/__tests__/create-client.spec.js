const fetch = require('cross-fetch');
const createClient = require('..');
const clientDefaults = {
  baseApiUrl: 'http://example.com',
  accountPassword: 'bar',
  apiKey: 'baz',
};

describe('createClient', () => {
  afterEach(() => {
    fetch.mockSuccessResponse();
    jest.restoreAllMocks();
  });

  it('throws if no credentials provided', () => {
    expect(() =>
      createClient({ accountPassword: 'foo' })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Expected apiKey to be non-empty string"`
    );
    expect(() =>
      createClient({ apiKey: 'foo' })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Expected accountPassword to be non-empty string"`
    );
  });

  it('resolves an object with client api', () => {
    expect(createClient(clientDefaults)).toEqual(expect.any(Object));
  });

  describe('auth', () => {
    it('validates credentials', async () => {
      await createClient(clientDefaults).auth();
      expect(fetch).toBeCalledWith(
        'http://example.com/auth',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it('rejects with invalid credentials', async () => {
      fetch.mockResponse({
        'http://example.com/auth': () => ({
          error: {
            name: 'AccessDenied',
            message: 'Too many attempts. Please try again later',
          },
        }),
      });
      await expect(createClient(clientDefaults).auth()).rejects.toBeDefined();
    });
  });

  describe('getClients', () => {
    it('resolves list of available clients', async () => {
      const client = createClient(clientDefaults);
      fetch.mockResponse({
        'http://example.com/email/clients': () => ({
          clients: ['client1', 'client2', 'client3', 'client4'],
        }),
      });
      expect(await client.getClients()).toEqual([
        'client1',
        'client2',
        'client3',
        'client4',
      ]);
    });
  });

  describe('getDefaultClients', () => {
    it('resolves default clients', async () => {
      const client = createClient(clientDefaults);
      fetch.mockResponse({
        'http://example.com/email/clients/default': () => ({
          clients: ['client1', 'client2'],
        }),
      });
      expect(await client.getDefaultClients()).toEqual(['client1', 'client2']);
    });
  });

  describe('setDefaultClients', () => {
    it('sets default clients', async () => {
      const client = createClient(clientDefaults);
      fetch.mockResponse({
        'http://example.com/email/clients/default': (body) => ({
          clients: body.clients,
        }),
      });
      expect(await client.setDefaultClients(['client1', 'client2'])).toEqual([
        'client1',
        'client2',
      ]);
    });
  });

  describe('getClientTips', () => {
    it('resolves client tips', async () => {
      const client = createClient(clientDefaults);
      fetch.mockResponse({
        'http://example.com/email/tips/outlook16': () => ({
          client: 'outlook16',
          tips: [{ name: 'usage', tip: 'Worst client ever' }],
        }),
      });
      expect(await client.getClientTips('outlook16')).toEqual([
        { name: 'usage', tip: 'Worst client ever' },
      ]);
    });
  });

  describe('createTest', () => {
    let client;

    beforeEach(() => {
      client = createClient(clientDefaults);
    });

    it('rejects with unexpected input', async () => {
      await expect(client.createTest()).rejects.toBeDefined();
      await expect(client.createTest({})).rejects.toBeDefined();
      await expect(client.createTest([])).rejects.toBeDefined();
      await expect(client.createTest(null)).rejects.toBeDefined();
      await expect(client.createTest(false)).rejects.toBeDefined();
      await expect(client.createTest('')).rejects.toBeDefined();
    });

    it('rejects if subject or html are empty', async () => {
      fetch.mockResponse({
        'http://example.com/email/tests': () => ({ id: 'id' }),
      });
      await expect(
        client.createTest({ subject: '', html: '' })
      ).rejects.toBeDefined();
    });

    it('makes rest api call', async () => {
      const url = 'http://example.com/email/tests';
      fetch.mockResponse({ [url]: () => ({ id: 'id' }) });
      const test = await client.createTest({ subject: 'foo', html: 'bar' });
      expect(fetch).toBeCalledWith(
        url,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
      expect(test).toMatchObject({ id: 'id' });
    });
  });

  describe('getTests', () => {
    let client;

    beforeAll(() => {
      client = createClient(clientDefaults);
    });

    it('makes rest api call', async () => {
      const url = 'http://example.com/email/tests';
      fetch.mockResponse({
        [url]: () => [
          { id: 'foo', date: 1370001284000, type: 'email-test', headers: {} },
          { id: 'bar', date: 1370001284000, type: 'email-test', headers: {} },
          { id: 'baz', date: 1370001284000, type: 'email-test', headers: {} },
        ],
      });
      expect(await client.getTests()).toEqual([
        { id: 'foo', date: expect.any(Date), type: 'email-test', headers: {} },
        { id: 'bar', date: expect.any(Date), type: 'email-test', headers: {} },
        { id: 'baz', date: expect.any(Date), type: 'email-test', headers: {} },
      ]);
      expect(fetch).toBeCalledWith(url, expect.any(Object));
    });
  });

  describe('getTest', () => {
    let client;

    beforeAll(() => {
      client = createClient(clientDefaults);
    });

    it('rejects if invalid test id provided', async () => {
      await expect(client.getTest(undefined)).rejects.toBeDefined();
      await expect(client.getTest(null)).rejects.toBeDefined();
    });

    it('makes rest api call', async () => {
      const url = 'http://example.com/email/tests/t3st';
      fetch.mockResponse({
        [url]: () => ({
          subject: 'foo',
          date: 1370001284000,
          completed: [],
          processing: [],
          bounced: [],
        }),
      });
      const info = await client.getTest('t3st');
      expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
      expect(info).toEqual({
        subject: 'foo',
        date: expect.any(Date),
        completed: expect.any(Array),
        processing: expect.any(Array),
        bounced: expect.any(Array),
      });
    });
  });

  describe('getResults', () => {
    let client;

    beforeAll(() => {
      client = createClient(clientDefaults);
    });

    it('rejects if invalid test id provided', async () => {
      await expect(client.getResults(undefined)).rejects.toBeDefined();
      await expect(client.getResults(null)).rejects.toBeDefined();
    });

    it('makes rest api call', async () => {
      const url = 'http://example.com/email/tests/t3st/results';
      fetch.mockResponse({
        [url]: () => ({
          outlook16: {
            id: 't3st',
            // eslint-disable-next-line camelcase
            display_name: 'Outlook 2016',
            client: 'outlook16',
            os: 'Windows',
            category: 'Application',
            screenshots: { default: 'http://bar/baz.png' },
            thumbnail: 'http://baz/bar.png',
            status: 'Processing',
            // eslint-disable-next-line camelcase
            status_details: { attemps: 1 },
          },
        }),
      });
      expect(await client.getResults('t3st')).toEqual([
        {
          id: 't3st',
          displayName: 'Outlook 2016',
          client: 'outlook16',
          os: 'Windows',
          category: 'Application',
          screenshots: { default: 'http://bar/baz.png' },
          thumbnail: 'http://baz/bar.png',
          status: 'Processing',
          statusDetails: { attemps: 1 },
        },
      ]);
      expect(fetch).toHaveBeenCalledWith(url, expect.any(Object));
    });
  });

  describe('getTestContent', () => {
    let client;

    beforeAll(() => {
      client = createClient(clientDefaults);
    });

    it('rejects if invalid test id provided', async () => {
      await expect(client.getTestContent(undefined)).rejects.toBeDefined();
      await expect(client.getTestContent(null)).rejects.toBeDefined();
    });

    it('makes rest api call', async () => {
      const markup = '<p>Hello</p>';
      fetch.mockResponse({
        'http://example.com/email/tests/t3st/content': () => ({
          content: markup,
        }),
      });
      const content = await client.getTestContent('t3st');
      expect(fetch).toHaveBeenCalledWith(
        'http://example.com/email/tests/t3st/content',
        expect.any(Object)
      );
      expect(typeof content).toEqual('string');
      expect(content).toEqual(markup);
    });
  });

  describe('deleteTest', () => {
    let client;

    beforeAll(() => {
      client = createClient(clientDefaults);
    });

    it('rejects if invalid test id provided', async () => {
      await expect(client.deleteTest(undefined)).rejects.toBeDefined();
      await expect(client.deleteTest(null)).rejects.toBeDefined();
    });

    it('makes rest api call', async () => {
      const url = 'http://example.com/email/tests/t3st';
      await client.deleteTest('t3st');
      expect(fetch).toHaveBeenCalledWith(
        url,
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('rejects with unexpected result', async () => {
      const url = 'http://example.com/email/tests/t3st';
      fetch.mockResponse({
        [url]: () => ({
          error: {
            name: 'AccessDenied',
            message: 'Too many attempts. Please try again later',
          },
        }),
      });
      await expect(client.deleteTest('t3st')).rejects.toBeDefined();
    });
  });
});
