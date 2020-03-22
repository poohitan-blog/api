require('dotenv').config();

const config = {
  development: {
    port: 3100,
    clientURL: 'http://localhost:7000',
    apiURL: 'http://localhost:3100',
    staticURL: 'http://localhost:3500',
    cookiesDomain: 'localhost',

    corsAllowedOrigins: ['*'],

    db: {
      host: 'localhost',
      name: 'poohitan-com-dev',
      port: 27017,
    },

    digitalOcean: {
      spaces: {
        name: 'poohitan-com',
        endpoint: 'ams3.digitaloceanspaces.com',
      },
    },

    microsoft: {
      azure: {
        computerVision: {
          key: process.env.MICROSOFT_AZURE_COMPUTER_VISION_KEY,
          endpoint: 'https://poohitan-com.cognitiveservices.azure.com/',
        },
        translatorText: {
          key: process.env.MICTOSOFT_AZURE_TRANSLATOR_TEXT_KEY,
          endpoint: 'https://api.cognitive.microsofttranslator.com/',
        },
      },
    },

    disqus: {
      shortname: 'poohitan',
      APIKey: process.env.DISQUS_SECRET,
    },

    jwtSecret: 'supersecret',

    telegram: {},
  },

  production: {
    port: 3000,
    clientURL: 'https://poohitan.com',
    apiURL: 'https://api.poohitan.com',
    staticURL: 'https://static.poohitan.com',
    cookiesDomain: '.poohitan.com',

    hotlinkingAllowedOrigins: [
      'poohitan.com',
      'new.poohitan.com',
    ],
    corsAllowedOrigins: [
      'poohitan.com',
      'new.poohitan.com',
      'api.poohitan.com',
    ],

    db: {
      host: 'localhost',
      name: 'poohitan-com',
      port: 27017,
    },

    digitalOcean: {
      spaces: {
        name: 'poohitan-com',
        endpoint: 'ams3.digitaloceanspaces.com',
      },
    },

    microsoft: {
      azure: {
        computerVision: {
          key: process.env.MICROSOFT_AZURE_COMPUTER_VISION_KEY,
          endpoint: 'https://poohitan-com.cognitiveservices.azure.com/',
        },
        translatorText: {
          key: process.env.MICTOSOFT_AZURE_TRANSLATOR_TEXT_KEY,
          endpoint: 'https://api.cognitive.microsofttranslator.com/',
        },
      },
    },

    disqus: {
      shortname: 'poohitan',
      APIKey: process.env.DISQUS_SECRET,
    },

    jwtSecret: process.env.JWT_SECRET,

    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
    },
  },
};

const environment = process.env.NODE_ENV;

module.exports = {
  ...config,
  current: {
    environment,
    ...config[environment],
  },
};
