const express = require('express');
const aws = require('aws-sdk');
const request = require('request');
const HttpStatus = require('http-status-codes');
const multer = require('multer');
const multerS3 = require('multer-s3');
const spiderDetector = require('spider-detector');

const config = require('../config').current;

const sanitizeFilename = require('../utils/sanitize-filename');
const hotlinkingProtector = require('../middlewares/hotlinking-protector');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();
const spacesEndpoint = new aws.Endpoint(config.digitalOcean.spaces.endpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: config.digitalOcean.spaces.name,
    acl: 'public-read',
    contentDisposition: 'inline',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, callback) {
      const fileName = `${config.environment}/images/${Date.now()}_${sanitizeFilename(file.originalname)}`;

      callback(null, fileName);
    },
  }),
}).array('images');

router.post('/', upload, (req, res) => {
  res.json(req.files.map((file) => {
    const keyWithoutEnvironment = file.key.replace(`${config.environment}/`, '');

    return `${config.apiURL}/${keyWithoutEnvironment}`;
  }));
});

router.use(spiderDetector.middleware());
router.use(hotlinkingProtector);

router.get('/:filename', (req, res, next) => {
  const originalURL = `https://${config.digitalOcean.spaces.name}.${config.digitalOcean.spaces.endpoint}/${config.environment}/images/${req.params.filename}`;

  request({
    url: originalURL,
    encoding: null,
  }, (error, response, body) => {
    if (error) {
      return next(error);
    }

    if (response.statusCode !== HttpStatus.OK) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    res.header({
      'Content-Disposition': 'inline',
    });

    return res.send(body);
  });
});

router.use(errorHandler);

module.exports = router;
