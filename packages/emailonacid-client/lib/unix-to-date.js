'use strict';

function unixToDate(unix) {
  return unix ? new Date(unix * 1000) : new Date();
}

module.exports = unixToDate;
