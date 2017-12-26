const express = require('express');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const pages = await models.page.find();

    res.json(pages.map(page => page.serialize()));
  } catch (error) {
    next(error);
  }
});

router.get('/:page_path', async (req, res, next) => {
  try {
    const page = await models.page.findOne({ path: req.params.page_path });

    res.json(page.serialize());
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
