const express = require('express');
const models = require('../models');

const router = express.Router();

router.get('/', (req, res) => {
  models.page.find()
    .then(pages => res.json(pages));
});

module.exports = router;
