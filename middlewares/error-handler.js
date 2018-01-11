const serializeError = require('serialize-error');
const HttpStatus = require('http-status-codes');
const Logger = require('logger');
const config = require('../config').current;

module.exports = (error, req, res, next) => { // eslint-disable-line
  const serializedError = serializeError(error);
  const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

  Logger.error(serializedError);

  serializedError.status = status;
  serializedError.message = serializedError.message || HttpStatus.getStatusText(status);

  if (config.environment !== 'development') {
    delete serializedError.stack;
  }

  res.status(status).json(serializedError);
};
