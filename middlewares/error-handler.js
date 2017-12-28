const serializeError = require('serialize-error');
const HttpStatus = require('http-status-codes');
const config = require('../config').current;
const Logger = require('../services/logger');

module.exports = (error, req, res, next) => { // eslint-disable-line
  Logger.error(error);

  const serializedError = serializeError(error);
  const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

  serializedError.status = status;
  serializedError.message = serializedError.message || HttpStatus.getStatusText(status);

  if (config.environment !== 'development') {
    delete serializedError.stack;
  }

  res.status(status).json(serializedError);
};
