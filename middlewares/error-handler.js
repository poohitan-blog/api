const serializeError = require('serialize-error');

module.exports = (error, req, res, next) => { // eslint-disable-line
  console.error(error);

  res.json(serializeError(error));
};
