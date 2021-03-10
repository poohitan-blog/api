const parseDomain = require('parse-domain');
const got = require('got');
const config = require('../config').current;

module.exports = (req, res, next) => {
  const { refererHeader } = req.headers;

  if (!refererHeader || req.isSpider()) {
    return next();
  }

  const { domain, tld } = parseDomain(refererHeader) || {};
  const refererDomain = [domain, tld].join('.');

  if (!config.hotlinkingAllowedOrigins || config.hotlinkingAllowedOrigins.includes(refererDomain)) {
    return next();
  }

  return req.pipe(got.stream(`${config.apiURL}/static/images/hotlinking-denied.png`)).pipe(res);
};
