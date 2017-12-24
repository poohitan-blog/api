const config = {
  development: {
    port: 6000,
    host: 'http://localhost:7000',

    db: {
      host: 'localhost',
      name: 'poohitan-com-dev',
      port: 27017,
    },
  },

  production: {
    port: 3000,
    host: 'https://new.poohitan.com',

    server: {
      host: '46.101.99.203',
      username: 'poohitan',
      folder: '~/poohitan.com/client',
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
  },
};

const environment = process.env.NODE_ENV;

module.exports = Object.assign({}, config, {
  current: Object.assign({ environment }, config[environment]),
});
