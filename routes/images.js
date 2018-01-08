const express = require('express');
const aws = require('aws-sdk');
const request = require('request');
const Busboy = require('busboy');
const mime = require('mime-types');
const sharp = require('sharp');

const config = require('../config').current;

const sanitizeFilename = require('../helpers/sanitize-filename');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();
const spacesEndpoint = new aws.Endpoint(config.digitalOcean.spaces.endpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});

const PREVIEW_WIDTH = 550;
const PREVIEW_BLUR = 25;
const MAX_WIDTH = 1920;

function generatePreview() {
  return sharp()
    .resize(PREVIEW_WIDTH, null)
    .withoutEnlargement()
    .blur(PREVIEW_BLUR);
}

function processBeforeUpload() {
  return sharp()
    .resize(MAX_WIDTH, null)
    .withoutEnlargement();
}

function upload(file, filename, contentType) {
  return s3.upload({
    Bucket: config.digitalOcean.spaces.name,
    Key: `${config.environment}/images/${Date.now()}_${sanitizeFilename(filename)}`,
    Body: file,
    ACL: 'public-read',
    ContentType: contentType,
    ContentDisposition: 'inline',
  })
    .promise()
    .then(data => data.Key);
}

function manageUpload(req) {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });
    const uploads = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
      uploads.push(upload(file.pipe(processBeforeUpload()), filename, mimeType));
    });

    busboy.on('finish', () => {
      Promise.all(uploads)
        .then((fileKeys) => {
          const proxiedLinks = fileKeys.map(key => `${config.apiURL}/${key.replace(`${config.environment}/`, '')}`);

          resolve(proxiedLinks);
        })
        .catch(reject);
    });

    req.pipe(busboy);
  });
}

router.post('/', routeProtector, (req, res, next) => {
  manageUpload(req)
    .then(links => res.json(links))
    .catch(next);
});

router.post('/froala', routeProtector, (req, res, next) => {
  manageUpload(req)
    .then(links => res.json({ link: links[0] }))
    .catch(next);
});

router.get('/:filename', (req, res, next) => {
  const originalURL = `https://${config.digitalOcean.spaces.name}.${config.digitalOcean.spaces.endpoint}/${config.environment}/images/${req.params.filename}`;
  const { preview } = req.query;

  res.header({
    'Content-Disposition': 'inline',
    'Content-Type': mime.lookup(req.params.filename),
  });

  if (preview) {
    return request(originalURL)
      .pipe(generatePreview())
      .on('error', error => next(`Invalid image ${req.params.filename}`))
      .pipe(res);
  }

  return request(originalURL)
    .pipe(res);
});

router.use(errorHandler);

module.exports = router;
