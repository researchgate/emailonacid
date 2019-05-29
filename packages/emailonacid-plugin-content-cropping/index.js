'use strict';

const stream = require('stream');
const createCropper = require('./lib/create-cropper');
const injectMarkers = require('./lib/inject-markers');

/**
 * Crops email content by visual markers
 */
function ContentCroppingPlugin({
  cropWhitespace = false,
  markerColor = '#ff00db',
  jpegMarkerColor = '#9f4094',
} = {}) {
  return {
    name: 'ContentCroppingPlugin',
    async prepare({ email, logger }) {
      logger.debug('preparing to inject visual markers');
      email.content = injectMarkers(markerColor, email.content);
      logger.debug('successfully injected visual markers');
    },
    async convert(context) {
      const { logger, email } = context;
      cropWhitespace = email.subject.includes('[crop]') || cropWhitespace;
      const converter = createCropper({
        cropWhitespace,
        markerColor,
        jpegMarkerColor,
        logger,
      });
      context.stream = context.stream.pipe(
        new stream.Transform({
          objectMode: true,
          transform([clientId, image], encoding, next) {
            logger.debug('cropping %s screenshot', clientId);
            converter(image).then((result) => next(null, [clientId, result]));
          },
        })
      );
    },
  };
}

module.exports = ContentCroppingPlugin;
