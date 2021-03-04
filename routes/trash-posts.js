const express = require('express');
const HttpStatus = require('http-status-codes');
const random = require('random');
const validateUUID = require('uuid-validate');
const {
  parse,
  sub,
  startOfSecond,
  endOfSecond,
} = require('date-fns');

const models = require('../models');
const Guard = require('../middlewares/guard');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.permalink) {
      const now = new Date();
      const createdAt = parse(req.query.permalink, 'yyyyMMdd_HHmmss', now);
      const timezoneOffset = now.getTimezoneOffset();

      filter.createdAt = {
        $gte: startOfSecond(sub(createdAt, { minutes: timezoneOffset })),
        $lte: endOfSecond(sub(createdAt, { minutes: timezoneOffset })),
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

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUUID = validateUUID(id);
    const fieldName = isUUID ? '_id' : 'shortId';
    const trashPost = await models.trashPost.findOne({ [fieldName]: id });

    if (!trashPost) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(trashPost.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', Guard.protectRoute, async (req, res, next) => {
  try {
    const trashPost = await models.trashPost.create(req.body);

    res.json(trashPost.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', Guard.protectRoute, async (req, res, next) => {
  try {
    const trashPost = await models.trashPost.findOneAndUpdate({
      _id: req.params.id,
    }, req.body, { new: true });

    res.json(trashPost.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', Guard.protectRoute, async (req, res, next) => {
  try {
    await models.trashPost.delete({ _id: req.params.id });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
