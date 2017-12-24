const express = require('express');
const models = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  models.post.find()
    .then(posts => res.json(posts.map(post => post.toObject())));
});

module.exports = router;
