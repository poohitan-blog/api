const sharp = require('sharp');
const ColorConvert = require('color-convert');

const ComputerVision = require('./azure/computer-vision');

const MIN_ACCEPTABLE_RECOGNITION_CONFIDENCE = 0.7;

async function getMetadata(file) {
  const metadata = await sharp(file)
    .metadata();

  return metadata;
}

async function getAverageColor(file) {
  const { channels } = await sharp(file).stats();
  const average = channels.map((channel) => channel.mean);

  return ColorConvert.rgb.hex(average);
}

async function getCaption(url) {
  const { captions } = await ComputerVision.describeImage(url);

  const [caption = {}] = captions;
  const { text = '', confidence } = caption;

  if (confidence < MIN_ACCEPTABLE_RECOGNITION_CONFIDENCE) {
    return null;
  }

  const [firstLetter, ...rest] = text.split('');
  const result = firstLetter && rest.length ? firstLetter.toUpperCase() + rest.join('') : '';

  return result;
}

async function toJpeg(buffer) {
  return sharp(buffer)
    .jpeg({ quality: 90 })
    .toBuffer();
}

module.exports = {
  getMetadata,
  getAverageColor,
  getCaption,
  toJpeg,
};
