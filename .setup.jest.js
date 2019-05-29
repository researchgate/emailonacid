const { toMatchImageSnapshot } = require('jest-image-snapshot');

jest.setTimeout(30e3);

expect.extend({ toMatchImageSnapshot });
