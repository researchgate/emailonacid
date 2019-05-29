'use strict';

const parse5 = require('parse5');

function createMarker(color) {
  const [fragmentNode] = parse5.parseFragment(
    `<table
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      style="border-collapse: collapse; width: 100% !important;"
    >
      <tbody>
        <tr><td style="height: 2px; line-height: 0;"></td></tr>
        <tr><td style="height: 1px; line-height: 0; background-color: ${color};"></td></tr>
        <tr><td style="height: 2px; line-height: 0;"></td></tr>
      </tbody>
    </table>`
  ).childNodes;
  return fragmentNode;
}

module.exports = createMarker;
