const geoip = require('geoip-lite');
const requestIp = require('request-ip');

module.exports = (req, res, next) => {
  const ip = requestIp.getClientIp(req);
  const { country, city, ll = [] } = geoip.lookup(ip) || {};
  const [longitude = 0, latitude = 0] = ll;

  req.geolocation = {
    country,
    city,
    longitude,
    latitude,
  };

  next();
};
