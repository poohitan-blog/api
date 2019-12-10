const uuid = require('uuid');
const request = require('request-promise-native');
const Logger = require('logger');

const config = require('../../config').current;

const { endpoint, key } = config.microsoft.azure.translatorText;

async function translate(text, { to = 'uk' } = {}) {
  const options = {
    method: 'POST',
    baseUrl: endpoint,
    url: 'translate',
    qs: {
      'api-version': '3.0',
      to: [to],
    },
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuid.v4().toString(),
    },
    body: [{
      text,
    }],
    json: true,
  };

  try {
    const body = await request(options);

    const [{ translations }] = body;
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
