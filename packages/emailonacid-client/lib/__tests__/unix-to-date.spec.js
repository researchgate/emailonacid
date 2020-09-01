const unixToDate = require('../unix-to-date');

describe('unixToDate', () => {
  it('uses current date if no timestamp is provided', () => {
    expect(unixToDate(null)).toEqual(expect.any(Date));
  });

  it('converts timestamp to Date object', () => {
    expect(unixToDate(1370001284000).toISOString()).toEqual(
      '+045383-08-12T08:13:20.000Z'
    );
  });
});
