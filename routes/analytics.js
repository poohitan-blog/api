const express = require('express');
const HttpStatus = require('http-status-codes');
const geoip = require('geoip-lite');
const requestIp = require('request-ip');
const isBot = require('isbot');
const { formatDistance } = require('date-fns');
const { uk } = require('date-fns/locale');

const { current } = require('../config');
const Telegram = require('../services/telegram');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

const GOOGLE_ANALYTICS_URL = 'https://analytics.google.com/analytics/web/?pli=1#/realtime/rt-overview/a10797087w72262200p74574726/';

function generateMessageTemplate({ title, body, geolocation }) {
  const {
    country,
    city,
    longitude,
    latitude,
  } = geolocation;

  const footer = `Геодані:
${country || 'N/A'}, ${city || 'N/A'}, <a href="https://www.google.com/maps/place/${longitude}, ${latitude}">${longitude}, ${latitude}</a>

<a href="${GOOGLE_ANALYTICS_URL}">Google Analytics</a>`;

  return `${title}

${body}

${footer}`;
}

router.use((req, res, next) => {
  if (isBot(req.headers['user-agent'])) {
    res.sendStatus(HttpStatus.NOT_ACCEPTABLE);

    return;
  }

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
});

router.post('/page-view', async (req, res, next) => {
  try {
    const { path } = req.body;
    const href = current.clientURL + path;

    const message = generateMessageTemplate({
      title: '<b>Новий перегляд сторінки</b>',
      body: `<a href="${href}">${decodeURIComponent(path)}</a>`,
      geolocation: req.geolocation,
    });

    if (current.environment === 'production') {
      Telegram.sendMessage(message);
    } else {
      console.info(message);
    }

    res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (error) {
    next(error);
  }
});

router.post('/flow', async (req, res, next) => {
  try {
    const body = JSON.parse(req.body);

    const flow = body.reduce((accumulator, item, index, collection) => {
      const nextItem = collection[index + 1];

      if (!nextItem) {
        return accumulator;
      }

      const openedAt = item.timestamp;
      const closedAt = nextItem.timestamp;

      return [
        ...accumulator,
        {
          path: item.path,
          openedAt,
          closedAt,
        },
      ];
    }, []);

    if (flow.length <= 0) {
      res.sendStatus(HttpStatus.BAD_REQUEST);

      return;
    }

    const flowDescription = flow
      .map(({ path, openedAt, closedAt }, index) => {
        const number = index + 1;
        const href = current.clientURL + path;
        const displayedPath = decodeURIComponent(path);
        const timeSpent = formatDistance(openedAt, closedAt, { locale: uk, includeSeconds: true });

        return `${number}. <a href="${href}">${displayedPath}</a> (${timeSpent})`;
      })
      .join('\n');

    const sessionStartedAt = flow[0].openedAt;
    const sessionEndedAt = flow[flow.length - 1].closedAt;

    const totalTimeSpent = formatDistance(sessionStartedAt, sessionEndedAt, {
      locale: uk,
      includeSeconds: true,
    });

    const message = generateMessageTemplate({
      title: `<b>Новий сеанс</b> (${totalTimeSpent})`,
      body: `Ланцюжок переходів:
${flowDescription}`,
      geolocation: req.geolocation,
    });

    if (current.environment === 'production') {
      Telegram.sendMessage(message);
    } else {
      console.info(message);
    }

    res.sendStatus(HttpStatus.NO_CONTENT);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
