const express = require('express');
const moment = require('moment');
const models = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
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

  models.trashPost.find(filter)
    .then(trashPosts => res.json(trashPosts.map(trashPost => trashPost.serialize())));
});

router.get('/:trash_post_id', (req, res) => {
  models.trashPost.findOne({ _id: req.params.trash_post_id })
    .then(trashPost => res.json(trashPost.serialize()));
});

module.exports = router;
