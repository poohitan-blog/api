const HttpStatus = require('http-status-codes');

function protectRoute(req, res, next) {
  if (!req.isAuthenticated) {
    return next({ status: HttpStatus.UNAUTHORIZED });
  }

  return next();
}

function protectPrivateData(req, res, next) {
  const { query } = req;

  if (query.private === true && !req.isAuthenticated) {
    next({ status: HttpStatus.UNAUTHORIZED });

    return;
  }

  if (!req.isAuthenticated) {
    query.private = false;
  }

  next();
}

module.exports = {
  protectRoute,
  protectPrivateData,
};
