const express = require('express');
const moment = require('moment');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    let filter = {};

    if (req.query.createdAt) {
      const createdAt = moment(req.query.createdAt);

      filter = {
        createdAt: {
          $gte: createdAt.clone().startOf('second'),
          $lte: createdAt.clone().endOf('second'),
        },
      };
    }

    const trashPosts = await models.trashPost.find(filter);

    res.json(trashPosts.map(trashPost => trashPost.serialize()));
  } catch (error) {
    next(error);
  }
});

router.get('/:trash_post_id', async (req, res, next) => {
  try {
    const trashPost = await models.trashPost.findOne({ _id: req.params.trash_post_id });

    res.json(trashPost.serialize());
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;