const jwt = require('jsonwebtoken');
const util = require('util');
const HttpStatus = require('http-status-codes');
const config = require('../config').current;

const verifyToken = util.promisify(jwt.verify);

module.exports = async (req, res, next) => {
  const { 'session-token': sessionToken } = req.cookies;

  req.isAuthenticated = false;

  if (!sessionToken) {
    next();

    return;
  }

  try {
    const { accessToken } = jwt.decode(sessionToken);
    const { id } = await verifyToken(accessToken, config.jwtSecret);

    req.userId = id;
    req.isAuthenticated = true;

    next();
  } catch (error) {
    res
      .status(HttpStatus.UNAUTHORIZED)
      .clearCookie('token', { domain: config.cookiesDomain })
      .json({ status: HttpStatus.UNAUTHORIZED });
  }
};
