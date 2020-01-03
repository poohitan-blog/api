const sharp = require('sharp');
const util = require('util');
const calculateAverageColor = util.promisify(require('image-average-color'));
const ColorConvert = require('color-convert');

const ComputerVision = require('./azure/computer-vision');

const MIN_ACCEPTABLE_RECOGNITION_CONFIDENCE = 0.7;

async function getMetadata(file) {
  const metadata = await sharp(file)
    .metadata();

  return metadata;
}

async function getAverageColor(file) {
  const averageColor = await calculateAverageColor(file);

  return averageColor ? ColorConvert.rgb.hex(averageColor) : null;
}

async function getCaption(url) {
  const { captions } = await ComputerVision.describeImage(url);

  const [caption = {}] = captions;
  const { text = '', confidence } = caption;
  const [firstLetter, ...rest] = text.split('');
  const result = firstLetter.toUpperCase() + rest.join('');

  return confidence > MIN_ACCEPTABLE_RECOGNITION_CONFIDENCE
    ? result
    : null;
}

module.exports = {
  getMetadata,
  getAverageColor,
  getCaption,
};
