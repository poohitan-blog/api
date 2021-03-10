const uuid = require('uuid');
const got = require('got');
const Logger = require('logger');

const config = require('../../config').current;

const { endpoint, key } = config.microsoft.azure.translatorText;

async function translate(text, { to = 'uk' } = {}) {
  const url = `${endpoint}/translate`;

  const options = {
    searchParams: {
      'api-version': '3.0',
      to,
    },
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuid.v4().toString(),
    },
    json: [{
      text,
    }],
  };

  try {
    const response = await got.post(url, options).json();

    const [{ translations }] = response;
    const [translation] = translations;

    return translation.text;
  } catch (error) {
    Logger.error(error);

    return error;
  }
}

module.exports = {
  translate,
};
