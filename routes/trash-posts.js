const express = require('express');
const moment = require('moment');
const HttpStatus = require('http-status-codes');
const random = require('random');

const models = require('../models');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.permalink) {
      const createdAt = moment.utc(req.query.permalink, 'YYYYMMDD_HHmmss');

      filter.createdAt = {
        $gte: createdAt.clone().startOf('second').toDate(),
        $lte: createdAt.clone().endOf('second').toDate(),
      };
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.trashPost.paginate(filter, {
      page,
      limit,
      sort: '-createdAt',
    });

    res.json({
      docs: docs.map(doc => doc.serialize()),
      meta: { currentPage: page, totalPages: pages },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/random', async (req, res, next) => {
  try {
    const trashPosts = await models.trashPost.find();

    const randomPostIndex = random.int(0, trashPosts.length - 1);
    const randomPost = trashPosts[randomPostIndex];

    return res.json(randomPost.serialize());
  } catch (error) {
    return next(error);
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

router.post('/', routeProtector, async (req, res, next) => {
  try {
    const trashPost = await models.trashPost.create(req.body);

    res.json(trashPost.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:trash_post_id', routeProtector, async (req, res, next) => {
  try {
    const trashPost = await models.trashPost.findOneAndUpdate({
      _id: req.params.trash_post_id,
    }, req.body, { new: true });

    res.json(trashPost.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:trash_post_id', routeProtector, async (req, res, next) => {
  try {
    await models.trashPost.delete({ _id: req.params.trash_post_id });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
