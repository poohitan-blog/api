const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const Guard = require('../middlewares/guard');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.moment, query: req.query });

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.moment
      .paginate(filter, {
        page,
        limit,
        sort: '-capturedAt',
      });

    res.json({
      docs: docs.map((doc) => doc.serialize()),
      meta: {
        currentPage: page,
        totalPages: pages,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const moment = await models.moment.findById(req.params.id);

    if (!moment) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(moment.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', Guard.protectRoute, async (req, res, next) => {
  try {
    const { body } = req;

    const moments = await models.moment.insertMany(body);

    res.json(moments.map((moment) => moment.serialize()));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', Guard.protectRoute, async (req, res, next) => {
  try {
    const { body, params } = req;

    const moment = await models.moment.findOneAndUpdate({
      _id: params.id,
    }, body, {
      new: true,
    });

    res.json(moment.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', Guard.protectRoute, async (req, res, next) => {
  try {
    await models.moment.delete({ _id: req.params.id });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
