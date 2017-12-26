const express = require('express');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const posts = await models.post.find();

    res.json(posts.map(post => post.serialize()));
  } catch (error) {
    next(error);
  }
});

router.get('/:post_path', async (req, res, next) => {
  try {
    const post = await models.post.findOne({ path: req.params.post_path });

    res.json(post.serialize());
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
