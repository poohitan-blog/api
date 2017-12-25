const express = require('express');
const models = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  models.post.find()
    .then(posts => res.json(posts.map(post => post.serialize())));
});

router.get('/:post_path', (req, res) => {
  models.post.findOne({ path: req.params.post_path })
    .then(post => res.json(post.serialize()));
});

module.exports = router;
