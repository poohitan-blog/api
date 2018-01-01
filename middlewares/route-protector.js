const HttpStatus = require('http-status-codes');

module.exports = (req, res, next) => {
  if (!req.isAuthenticated) {
    return next({ status: HttpStatus.UNAUTHORIZED });
  }

  return next();
};
