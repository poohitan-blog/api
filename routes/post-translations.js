const express = require('express');
const HttpStatus = require('http-status-codes');
const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const Guard = require('../middlewares/guard');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.postTranslation, query: req.query });

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.postTranslation.paginate(filter, {
      page,
      limit,
    });

    res.json({
      docs: docs.map((doc) => doc.serialize()),
      meta: { currentPage: page, totalPages: pages },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const postTranslation = await models.postTranslation.findOne({ _id: req.params.id });

    if (!postTranslation) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(postTranslation.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', Guard.protectRoute, async (req, res, next) => {
  try {
    const postTranslation = await models.postTranslation.create(req.body);

    res.json(postTranslation.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', Guard.protectRoute, async (req, res, next) => {
  try {
    const postTranslation = await models.postTranslation.findOneAndUpdate({
      _id: req.params.id,
    }, req.body, { new: true });

    res.json(postTranslation.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', Guard.protectRoute, async (req, res, next) => {
  try {
    await models.postTranslation.delete({ _id: req.params.id });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
