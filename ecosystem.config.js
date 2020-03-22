module.exports = {
  apps: [{
    name: 'poohitan-com-api',
    script: 'app.js',

    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],

  deploy: {
    production: {
      user: 'poohitan',
      host: '46.101.99.203',
      ref: 'origin/production',
      repo: 'git@github.com:poohitan-blog/api.git',
      path: '/home/poohitan/poohitan.com/api',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production --update-env',
    },
  },
};
