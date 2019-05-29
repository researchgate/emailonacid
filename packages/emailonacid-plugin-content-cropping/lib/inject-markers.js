'use strict';

const parse5 = require('parse5');
const createMarker = require('./create-marker');
const byTagName = (tagName) => (node) => node.tagName === tagName;

function injectMarkers(color, content) {
  const doc = parse5.parse(content);
  const html = doc.childNodes.find(byTagName('html'));
  const body = html.childNodes.find(byTagName('body'));
  body.childNodes = [
    createMarker(color),
    ...body.childNodes,
    createMarker(color),
  ];
  return parse5.serialize(doc);
}

module.exports = injectMarkers;
