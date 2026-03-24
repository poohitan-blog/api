const HttpStatus = require('http-status-codes');

const config = require('../config').current;

function protectRoute(req, res, next) {
  if (!req.userId === config.poohitanId) {
    return next({ status: HttpStatus.UNAUTHORIZED });
  }

  return next();
}

function protectRouteLess(req, res, next) {
  if (!req.isAuthenticated) {
    return next({ status: HttpStatus.UNAUTHORIZED });
  }

  return next();
}

function excludeHiddenData(req, res, next) {
  const { query } = req;

  if (query.hidden === true && !req.isAuthenticated) {
    next({ status: HttpStatus.UNAUTHORIZED });

    return;
  }

  if (!req.isAuthenticated) {
    query.hidden = false;
  }

  next();
}

module.exports = {
  protectRoute,
  protectRouteLess,
  excludeHiddenData,
};
