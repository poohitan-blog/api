const express = require('express');
const HttpStatus = require('http-status-codes');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;

    const { docs, pages } = await models.page.paginate({}, {
      page,
      limit,
      sort: '-createdAt',
    });

    res.json({ docs: docs.map(doc => doc.serialize()), meta: { page, pages } });
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

router.use(errorHandler);

module.exports = router;
