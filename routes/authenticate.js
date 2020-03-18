const express = require('express');
const util = require('util');
const { add } = require('date-fns');
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const Telegram = require('../services/telegram');

const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const requestLocator = require('../middlewares/request-locator');
const config = require('../config').current;

const signToken = util.promisify(jwt.sign);
const router = express.Router();

const notifyAboutLoginAttempt = async ({ password, geolocation, successfull }) => {
  const {
    country,
    city,
    longitude,
    latitude,
  } = geolocation;

  const geolocationString = `Геодані:
${country || 'N/A'}, ${city || 'N/A'}, <a href="https://www.google.com/maps/place/${longitude}, ${latitude}">${longitude}, ${latitude}</a>`;

  if (successfull) {
    return Telegram.sendMessage(`<b>Якийсь покидьок успішно зайшов в Нарнію</b>

${geolocationString}`);
  }

  const encodedPassword = password
    .split('')
    .map((char, index) => (index < 2 || index > password.length - 3 ? char : '*'))
    .join('');


  return Telegram.sendMessage(`<b>Якийсь покидьок намагається підібрати пароль!</b>

Його спроба: <pre>${encodedPassword}</pre> (див. серверні логи)

${geolocationString}`);
};

router.post('/', requestLocator, async (req, res, next) => {
  try {
    const { login, password } = req.body;
    const user = await models.user.findOne({ login });

    if (!user || user.password !== password) {
      notifyAboutLoginAttempt({ password, geolocation: req.geolocation, successfull: false });

      return next({ status: HttpStatus.FORBIDDEN });
    }

    const token = await signToken({ id: user._id }, config.jwtSecret);
    const expires = add(new Date(), { weeks: 1 });

    notifyAboutLoginAttempt({ geolocation: req.geolocation, successfull: true });

    return res
      .cookie('token', token, { expires, domain: config.cookiesDomain })
      .json({
        token,
        id: user._id,
      });
  } catch (error) {
    return next(error);
  }
});

router.use(errorHandler);

module.exports = router;
