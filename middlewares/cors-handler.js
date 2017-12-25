const parseDomain = require('parse-domain');
const config = require('../config').current;
const HttpStatus = require('http-status-codes');

const allowedHeaders = [
  'Origin',
  'Content-Type',
  'Accept',
  'Authorization',
  'X-Access-Token',
  'X-Accept-Locale',
  'X-Requested-With',
];
const allowedMethods = [
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
];

module.exports = (req, res, next) => {
  const originHeader = req.headers.origin;
  const { domain, tld } = originHeader ? parseDomain(originHeader) || {} : {};
  const originDomain = [domain, tld].join('.');

  const allowOriginHeader = config.corsAllowedOrigins.includes(originDomain)
    || config.corsAllowedOrigins.includes('*')
    ? originHeader : null;

  res.header({
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': allowOriginHeader,
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Allow-Methods': allowedMethods.join(', '),
  });

  if (req.method.toUpperCase() === 'OPTIONS') {
    return res.sendStatus(HttpStatus.OK);
  }

  return next();
};
