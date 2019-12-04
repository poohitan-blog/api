const sharp = require('sharp');
const util = require('util');
const calculateAverageColor = util.promisify(require('image-average-color'));
const ColorConvert = require('color-convert');
const Logger = require('logger');

async function getImageMedatada(file) {
  const [averageColor, metadata] = await Promise.all([
    calculateAverageColor(file)
      .catch(error => Logger.error(error)),
    sharp(file)
      .metadata()
      .catch(error => Logger.error(error)),
  ]);

  return {
    averageColor: averageColor ? ColorConvert.rgb.hex(averageColor) : null,
    ...metadata,
  };
}

module.exports = {
  getImageMedatada,
};
