const { URL } = require('url');
const request = require('request');
const config = require('../config').current;

const whiteList = [/(.+?\.)?poohitan\.com/];

module.exports = (req, res, next) => {
  const { referer } = req.headers;

  if (!referer || req.isSpider()) {
    return next();
  }

  const refererURL = new URL(referer);
  const refererHostname = refererURL.hostname;

  if (whiteList.some(host => host.test(refererHostname))) {
    return next();
  }

  return req.pipe(request(`${config.apiURL}/static/images/hotlinking-denied.png`)).pipe(res);
};
