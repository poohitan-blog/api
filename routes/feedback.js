const express = require('express');
const HttpStatus = require('http-status-codes');
const slowDown = require('express-slow-down');

const Telegram = require('../services/telegram');
const errorHandler = require('../middlewares/error-handler');
const requestLocator = require('../middlewares/request-locator');

const router = express.Router();

const speedLimiter = slowDown({
  windowMs: 30 * 1000,
  delayAfter: 2,
  delayMs: 2000,
});

router.post('/', speedLimiter, requestLocator, async (req, res, next) => {
  try {
    const { text } = req.body;
    const {
      country,
      city,
      longitude,
      latitude,
    } = req.geolocation;

    const message = `<b>Анонімне повідомлення</b>

${text}

Геодані:
${country || 'N/A'}, ${city || 'N/A'}, <a href="https://www.google.com/maps/place/${longitude}, ${latitude}">${longitude}, ${latitude}</a>`;

    Telegram.sendMessage(message);

    res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
