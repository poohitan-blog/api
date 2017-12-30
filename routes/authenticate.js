const express = require('express');
const util = require('util');
const moment = require('moment');
const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const config = require('../config').current;

const signToken = util.promisify(jwt.sign);
const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { login, password } = req.body;
    const user = await models.user.findOne({ login });

    if (!user) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    if (user.password !== password) {
      return next({ status: HttpStatus.FORBIDDEN });
    }

    const token = await signToken({ id: user._id }, config.jwtSecret);
    const expires = moment().add(1, 'weeks').toDate();

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
