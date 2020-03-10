const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const Guard = require('../middlewares/guard');
const errorHandler = require('../middlewares/error-handler');
const renderSass = require('../utils/render-sass');

const router = express.Router();

router.get('/', Guard.excludeHiddenData, async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.page, query: req.query });

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.page.paginate(filter, {
      page,
      limit,
      sort: '-createdAt',
      select: '-customStyles -customStylesProcessed',
    });

    res.json({
      docs: docs.map(doc => doc.serialize()),
      meta: { currentPage: page, totalPages: pages },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const page = await models.page.findOne({ slug: req.params.slug });

    if (!page) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(page.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', Guard.protectRoute, async (req, res, next) => {
  try {
    const { body } = req;

    const page = await models.page.create({
      ...body,
      customStylesProcessed: await renderSass(body.customStyles),
    });

    res.json(page.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:slug', Guard.protectRoute, async (req, res, next) => {
  try {
    const { body, params } = req;

    const page = await models.page.findOneAndUpdate({
      slug: params.slug,
    }, {
      ...body,
      customStylesProcessed: await renderSass(body.customStyles),
    }, {
      new: true,
    });

    res.json(page.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:slug', Guard.protectRoute, async (req, res, next) => {
  try {
    await models.page.delete({ slug: req.params.slug });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
