const express = require('express');
const moment = require('moment');
const HttpStatus = require('http-status-codes');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.createdAt) {
      const createdAt = moment(req.query.createdAt);

      filter.createdAt = {
        $gte: createdAt.clone().startOf('second'),
        $lte: createdAt.clone().endOf('second'),
      };
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.trashPost.paginate(filter, {
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

router.get('/:trash_post_id', async (req, res, next) => {
  try {
    const trashPost = await models.trashPost.findOne({ _id: req.params.trash_post_id });

    if (!trashPost) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(trashPost.serialize());
  } catch (error) {
    return next(error);
  }
});

router.use(errorHandler);

module.exports = router;
