'use strict';

const merge = require('lodash.merge');

function createState(
  initialState = {
    availableClients: require('./clients.json'),
    defaultClients: ['iphone6p_9', 'gmail_chr26_win', 'outlook16'],
    public: process.cwd(),
    results: {},
    tests: {},
  }
) {
  let state = initialState;
  const getState = () => state;
  const setState = (update) => (state = merge({}, state, update));
  const resetState = () => setState(initialState);

  return {
    getState,
    setState,
    resetState,
  };
}

module.exports = createState();
