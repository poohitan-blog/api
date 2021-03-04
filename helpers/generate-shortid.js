const { customAlphabet } = require('nanoid');

const DEFAULT_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DEFAULT_LENGTH = 10;

function generateShortId(length = DEFAULT_LENGTH, alphabet = DEFAULT_ALPHABET) {
  const nanoid = customAlphabet(alphabet, length);

  return nanoid();
}

module.exports = generateShortId;
