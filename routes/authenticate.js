const express = require('express');
const util = require('util');
const argon2 = require('argon2');
const { add } = require('date-fns');
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');

const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const requestLocator = require('../middlewares/request-locator');
const notifyAboutLoginAttempt = require('../helpers/notify-about-login-attempt');
const config = require('../config').current;

const signToken = util.promisify(jwt.sign);
const router = express.Router();

router.post('/', requestLocator, async (req, res, next) => {
  try {
    const { login, password } = req.body;
    const user = await models.user.findOne({ login });

    const passwordCorrect = await argon2.verify(user.password, password);

    if (!user || !passwordCorrect) {
      notifyAboutLoginAttempt({
        password,
        geolocation: req.geolocation,
        successfull: false,
      });

      return next({ status: HttpStatus.FORBIDDEN });
    }

    const token = await signToken({ id: user._id }, config.jwtSecret);
    const expires = add(new Date(), { weeks: 1 });

    notifyAboutLoginAttempt({
      geolocation: req.geolocation,
      successfull: true,
    });

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
