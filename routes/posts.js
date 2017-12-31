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

    if (!req.isAuthenticated) {
      filter.private = false;
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.post.paginate(filter, {
      page,
      limit,
      sort: '-publishedAt',
    });

    res.json({
      docs: docs.map(doc => doc.serialize()),
      meta: { currentPage: page, totalPages: pages },
    });
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

    if (post.private && !req.isAuthenticated) {
      return next({ status: HttpStatus.UNAUTHORIZED });
    }

    return res.json(post.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const post = await models.post.create(req.body);

    res.json(post.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:post_path', async (req, res, next) => {
  try {
    const post = await models.post.findOneAndUpdate({ path: req.params.post_path }, req.body, { new: true });

    res.json(post.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:post_path', async (req, res, next) => {
  try {
    await models.post.delete({ path: req.params.post_path });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
