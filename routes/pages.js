const express = require('express');
const HttpStatus = require('http-status-codes');

const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');
const renderSass = require('../utils/render-sass');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.page, query: req.query });

    if (!req.isAuthenticated) {
      filter.private = false;
    }

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

router.get('/:page_path', async (req, res, next) => {
  try {
    const page = await models.page.findOne({ path: req.params.page_path });

    if (!page) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(page.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', routeProtector, async (req, res, next) => {
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

router.patch('/:page_path', routeProtector, async (req, res, next) => {
  try {
    const { body, params } = req;

    const page = await models.page.findOneAndUpdate({
      path: params.page_path,
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

router.delete('/:page_path', routeProtector, async (req, res, next) => {
  try {
    await models.page.delete({ path: req.params.page_path });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
