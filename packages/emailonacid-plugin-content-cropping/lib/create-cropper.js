'use strict';

const { spawnSync } = require('child_process');
const Jimp = require('jimp');

function createCropper({
  cropWhitespace,
  markerColor,
  jpegMarkerColor,
  logger,
}) {
  return async (image) => {
    try {
      const color =
        image.getMIME() === Jimp.MIME_JPEG ? jpegMarkerColor : markerColor;
      const options = {
        input: await image.getBufferAsync(Jimp.MIME_PNG),
        stdio: ['pipe', 'inherit', 'inherit', 'pipe'],
      };
      return await Jimp.read(
        spawnSync(
          process.execPath,
          [require.resolve('./cropper-worker'), color, cropWhitespace],
          options
        ).output[3]
      );
    } catch (reason) {
      logger.error('failed to identify visual markers');
      logger.error('perhaps screenshot is corrupted?');
      logger.error(reason);
      return image;
    }
  };
}

module.exports = createCropper;
