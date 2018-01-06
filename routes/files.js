const express = require('express');
const aws = require('aws-sdk');
const request = require('request');
const multer = require('multer');
const multerS3 = require('multer-s3');
const mime = require('mime-types');

const config = require('../config').current;

const sanitizeFilename = require('../helpers/sanitize-filename');
const routeProtector = require('../middlewares/route-protector');
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
    contentDisposition: 'attachment',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, callback) {
      const fileName = `${config.environment}/files/${Date.now()}_${sanitizeFilename(file.originalname)}`;

      callback(null, fileName);
    },
  }),
}).any('files');

router.post('/', routeProtector, upload, (req, res) => {
  res.json(req.files.map((file) => {
    const keyWithoutEnvironment = file.key.replace(`${config.environment}/`, '');

    return `${config.apiURL}/${keyWithoutEnvironment}`;
  }));
});

router.post('/froala', routeProtector, upload, (req, res) => {
  const file = req.files[0];
  const keyWithoutEnvironment = file.key.replace(`${config.environment}/`, '');

  res.json({
    link: `${config.apiURL}/${keyWithoutEnvironment}`,
  });
});

router.get('/:filename', (req, res, next) => {
  const originalURL = `https://${config.digitalOcean.spaces.name}.${config.digitalOcean.spaces.endpoint}/${config.environment}/files/${req.params.filename}`;

  res.header({
    'Content-Disposition': 'attachment',
    'Content-Type': mime.lookup(req.params.filename),
  });

  request(originalURL)
    .pipe(res)
    .on('error', error => next(error));
});

router.use(errorHandler);

module.exports = router;
