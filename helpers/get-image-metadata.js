const sharp = require('sharp');
const util = require('util');
const calculateAverageColor = util.promisify(require('image-average-color'));
const ColorConvert = require('color-convert');

module.exports = function getImageMedatada(image) {
  return Promise.all([
    calculateAverageColor(image)
      .catch(error => console.error(error)),
    sharp(image)
      .metadata(),
  ])
    .then(([averageColor, metadata]) => ({
      averageColor: averageColor ? ColorConvert.rgb.hex(averageColor) : null,
      ...metadata,
    }));
};
