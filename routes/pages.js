const express = require('express');
const HttpStatus = require('http-status-codes');
const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.post, query: req.query });

    if (!req.isAuthenticated) {
      filter.private = false;
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.page.paginate(filter, {
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
    const page = await models.page.create(req.body);

    res.json(page.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:page_path', routeProtector, async (req, res, next) => {
  try {
    const page = await models.page.findOneAndUpdate({ path: req.params.page_path }, req.body, { new: true });

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
