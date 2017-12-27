const express = require('express');
const HttpStatus = require('http-status-codes');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;

    const { docs, pages } = await models.post.paginate(filter, {
      page,
      limit,
      sort: '-publishedAt',
    });

    res.json({ docs: docs.map(doc => doc.serialize()), meta: { page, pages } });
  } catch (error) {
    next(error);
  }
});

router.get('/:post_path', async (req, res, next) => {
  try {
    const post = await models.post.findOne({ path: req.params.post_path });

    if (!post) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(post.serialize());
  } catch (error) {
    return next(error);
  }
});

router.use(errorHandler);

module.exports = router;
