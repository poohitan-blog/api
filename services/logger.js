const chalk = require('chalk');
const serializeError = require('serialize-error');

const MAX_MESSAGE_LENGTH = 5000;

const prettifyJSON = json => JSON.stringify(json, null, 2);
const timestamp = message => `${new Date().toISOString()}: ${message}`;
const cut = message => (message.length > MAX_MESSAGE_LENGTH ? `${message.slice(0, MAX_MESSAGE_LENGTH)}...` : message);

const log = (...messages) => console.log(chalk.white(timestamp(messages.join(' '))));

const request = (req, res, next) => {
  const requestBody = typeof req.body === 'string' ? cut(req.body) : cut(prettifyJSON(req.body));
  const serializedRequest = `[${req.method}] ${req.url}\n${requestBody}`;

  console.log(chalk.blue(timestamp(serializedRequest)));
  next();
};

const query = (collection, method, query, doc) => { // eslint-disable-line
  const serializedQuery = `${collection}.${method}(${JSON.stringify(query)}) [${prettifyJSON(doc)}]`;

  console.log(chalk.magenta(timestamp(serializedQuery)));
};

const success = (...messages) => {
  console.log(chalk.green(timestamp(messages.join(' '))));
};

const warning = (...messages) => {
  console.log(chalk.yellow(timestamp(messages.join(' '))));
};

const error = (...errors) => {
  const stingifiedErrors = errors.map(error => prettifyJSON(serializeError(error))); // eslint-disable-line

  console.log(chalk.red(timestamp(stingifiedErrors.join(' '))));
};

module.exports = {
  log,
  request,
  error,
  warning,
  success,
  query,
};
