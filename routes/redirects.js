const express = require('express');
const HttpStatus = require('http-status-codes');
const models = require('../models');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.redirect.paginate(filter, {
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

router.get('/:redirect_from', async (req, res, next) => {
  try {
    const redirect = await models.redirect.findOne({ from: req.params.redirect_from });

    if (!redirect) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(redirect.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', routeProtector, async (req, res, next) => {
  try {
    const redirect = await models.redirect.create(req.body);

    res.json(redirect.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:redirect_id', routeProtector, async (req, res, next) => {
  try {
    const redirect = await models.redirect.findOneAndUpdate({
      _id: req.params.redirect_id,
    }, req.body, { new: true });

    res.json(redirect.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:redirect_id', routeProtector, async (req, res, next) => {
  try {
    await models.redirect.delete({ _id: req.params.redirect_id });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
