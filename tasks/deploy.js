const { argv } = require('yargs'); // eslint-disable-line
const execSSH = require('../utils/exec-ssh');
const fs = require('fs');
const Logger = require('../services/logger');

const env = argv.e || argv.env || argv.environment;

if (!env) {
  Logger.error('Error: You must pass the environment as an argument');

  process.exit(1);
}

const config = require('../config')[env];

const { host, username, folder } = config.server;
const { repo } = config.git;
const branch = argv.branch || argv.b || config.git.branch;
const { appName } = config.pm2;

const privateKey = fs.readFileSync('/Users/poohitan/.ssh/id_rsa');

const exec = command => execSSH({ host, username, privateKey })(`source ~/.profile && ${command}`);

const envVariables = {
  NODE_ENV: env,
  AWS_ACCESS_KEY_ID: process.env.DIGITAL_OCEAN_SPACE_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.DIGITAL_OCEAN_SPACE_SECRET,
  POOHITAN_COM_JWT_SECRET: process.env.DIGITAL_OCEAN_SPACE_SECRET,
};

const envVariablesString = Object.keys(envVariables).map(envVariableName => `export ${envVariableName}=${envVariables[envVariableName]}`).join(' && ');

exec(`git clone -b ${branch} ${repo} ${folder}/new`)
  .then(() => exec(`npm install --prefix ${folder}/new`))
  .then(() => exec(`rm -rf ${folder}/current`))
  .then(() => exec(`mv ${folder}/new ${folder}/current`))
  .then(() => exec(`pm2 stop ${appName}`))
  .then(() => exec(`${envVariablesString} && pm2 start ${folder}/current/app.js --name ${appName} --update-env`))
  .then(() => Logger.success('Deployed successfully.'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
