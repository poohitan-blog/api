const express = require('express');
const models = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  models.trashPost.find()
    .then(trashPosts => res.json(trashPosts.map(trashPost => trashPost.serialize())));
});

router.get('/:trash_post_id', (req, res) => {
  models.trashPost.findOne({ _id: req.params.trash_post_id })
    .then(trashPost => res.json(trashPost.serialize()));
});

module.exports = router;
