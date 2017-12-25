const express = require('express');
const models = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  models.page.find()
    .then(pages => res.json(pages.map(page => page.serialize())));
});

router.get('/:page_path', (req, res) => {
  models.page.findOne({ path: req.params.page_path })
    .then(page => res.json(page.serialize()));
});

module.exports = router;
