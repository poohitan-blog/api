const express = require('express');
const HttpStatus = require('http-status-codes');
const wkhtmltopdf = require('wkhtmltopdf');

const config = require('../config').current;

const router = express.Router();

router.get('/*', async (req, res, next) => {
  console.log('!!', req.params);
  try {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${req.params[0]}.pdf`,
    });

    const url = `https://poohitan.com/${req.params[0]}`;

    console.log('url', url);

    wkhtmltopdf(url)
      .pipe(res);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
