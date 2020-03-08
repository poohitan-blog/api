const express = require('express');
const RSS = require('rss');
const moment = require('moment');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const config = require('../config').current;

const router = express.Router();

const FEED_MAX_ITEMS = 20;

router.get('/', async (req, res, next) => {
  try {
    const feed = new RSS({
      title: 'poohitan',
      feed_url: `${config.clientURL}/rss`,
      site_url: `${config.clientURL}`,
      image_url: `${config.clientURL}/static/logo.png`,
      language: 'uk',
      pubDate: moment().toDate(),
    });

    const { docs } = await models.post.paginate({ private: false }, {
      page: 1,
      limit: FEED_MAX_ITEMS,
      sort: '-publishedAt',
    });

    docs.forEach(post => feed.item({
      title: post.title,
      description: post.getCutBody(),
      url: `${config.clientURL}/p/${post.slug}`,
      guid: post._id,
      date: post.publishedAt,
    }));

    const xml = feed.xml({ indent: config.enironment === 'production' });

    res.header({ 'Content-Type': 'application/rss+xml' }).send(xml);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
