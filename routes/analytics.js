const express = require('express');
const HttpStatus = require('http-status-codes');
const isBot = require('isbot');
const { formatDistance } = require('date-fns');
const { uk } = require('date-fns/locale');

const { current } = require('../config');
const Telegram = require('../services/telegram');
const errorHandler = require('../middlewares/error-handler');
const requestLocator = require('../middlewares/request-locator');

const router = express.Router();

const GOOGLE_ANALYTICS_URL = 'https://analytics.google.com/analytics/web/?pli=1#/realtime/rt-overview/a10797087w72262200p74574726/';

function generateMessageTemplate({
  title,
  body,
  geolocation,
  userAgent,
}) {
  const {
    country,
    city,
    longitude,
    latitude,
  } = geolocation;

  const footerContent = [];

  if (geolocation) {
    footerContent.push(`Геодані:
${country || 'N/A'}, ${city || 'N/A'}, <a href="https://www.google.com/maps/place/${longitude}, ${latitude}">${longitude}, ${latitude}</a>`);
  }

  if (userAgent) {
    footerContent.push(`User-Agent: <pre>${userAgent}</pre>`);
  }

  footerContent.push(`<a href="${GOOGLE_ANALYTICS_URL}">Google Analytics</a>`);

  return `${title}

${body}

${footerContent.join('\n\n')}`;
}

router.use((req, res, next) => {
  if (isBot(req.headers['user-agent'])) {
    res.sendStatus(HttpStatus.NOT_ACCEPTABLE);

    return;
  }

  next();
});

router.use(requestLocator);

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

    const atLeastOneItemHasPath = body.some(item => item.path);

    if (!atLeastOneItemHasPath) {
      next({ status: HttpStatus.BAD_REQUEST });

      return;
    }

    const flow = body.reduce((accumulator, item, index, collection) => {
      const nextItem = collection[index + 1];
      const prevItem = collection[index - 1];

      if (!nextItem) {
        return accumulator;
      }

      const missingPath = !item.path;
      const duplicatePath = prevItem && prevItem.path === item.path;

      if (missingPath || duplicatePath) {
        return [
          ...accumulator.slice(0, -1),
          {
            path: prevItem.path,
            openedAt: prevItem.timestamp,
            closedAt: nextItem.timestamp,
          },
        ];
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

    if (flow.length === 0) {
      next({ status: HttpStatus.BAD_REQUEST });

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
