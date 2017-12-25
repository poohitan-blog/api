const config = {
  development: {
    port: 3100,
    clientURL: 'http://localhost:7000',
    apiURL: 'http://localhost:3100',

    allowedOrigins: ['*'],

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
  },

  production: {
    port: 3000,
    clientURL: 'https://new.poohitan.com',
    apiURL: 'https://api.poohitan.com',

    allowedOrigins: [
      'poohitan.com',
    ],

    server: {
      host: '46.101.99.203',
      username: 'poohitan',
      folder: '~/poohitan.com/api',
    },

    db: {
      host: 'localhost',
      name: 'poohitan-com',
      port: 27017,
    },

    git: {
      repo: 'git@github.com:poohitan-blog/api.git',
      branch: 'production',
    },

    pm2: {
      appName: 'poohitan-com-api',
    },

    digitalOcean: {
      spaces: {
        name: 'poohitan-com',
        endpoint: 'ams3.digitaloceanspaces.com',
      },
    },
  },
};

const environment = process.env.NODE_ENV;

module.exports = Object.assign({}, config, {
  current: Object.assign({ environment }, config[environment]),
});
