const jwt = require('jsonwebtoken');
const util = require('util');
const HttpStatus = require('http-status-codes');
const config = require('../config').current;

const verifyToken = util.promisify(jwt.verify);

module.exports = async (req, res, next) => {
  const { token } = req.cookies;

  req.isAuthenticated = false;

  if (!token) {
    return next();
  }

  try {
    const { id } = await verifyToken(token, config.jwtSecret);

    req.userId = id;
    req.isAuthenticated = true;

    return next();
  } catch (error) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .clearCookie('token', { domain: config.cookiesDomain })
      .json({ status: HttpStatus.UNAUTHORIZED });
  }
};
