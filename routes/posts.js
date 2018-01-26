const express = require('express');
const HttpStatus = require('http-status-codes');
const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');
const getCommentsCount = require('../utils/get-comments-count');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.post, query: req.query });

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

    const commentsCounts = await getCommentsCount(docs.map(doc => doc.path));

    res.json({
      docs: docs.map(doc => Object.assign({ commentsCount: commentsCounts[doc.path] }, doc.serialize())),
      meta: { currentPage: page, totalPages: pages },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:post_path', async (req, res, next) => {
  try {
    const post = await models.post.findOne({ path: req.params.post_path });
    const commentsCount = await getCommentsCount(req.params.post_path);
    const postWithCommentsCount = Object.assign({ commentsCount }, post.serialize());

    if (!post) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(postWithCommentsCount);
  } catch (error) {
    return next(error);
  }
});

router.post('/', routeProtector, async (req, res, next) => {
  try {
    const post = await models.post.create(req.body);

    res.json(post.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:post_path', routeProtector, async (req, res, next) => {
  try {
    const post = await models.post.findOneAndUpdate({ path: req.params.post_path }, req.body, { new: true });

    res.json(post.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:post_path', routeProtector, async (req, res, next) => {
  try {
    await models.post.delete({ path: req.params.post_path });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
