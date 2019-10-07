const express = require('express');
const aws = require('aws-sdk');
const Busboy = require('busboy');
const sharp = require('sharp');
const Logger = require('logger');

const config = require('../config').current;

const slugifyText = require('../helpers/slugify-text');
const sanitizeFilename = require('../helpers/sanitize-filename');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();
const spacesEndpoint = new aws.Endpoint(config.digitalOcean.spaces.endpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});

const MAX_WIDTH = 1920;

function processBeforeUpload() {
  return sharp()
    .resize(MAX_WIDTH, null)
    .withoutEnlargement();
}

function upload(file, filename, contentType) {
  return s3.upload({
    Bucket: config.digitalOcean.spaces.name,
    Key: `${config.environment}/images/${Date.now()}_${sanitizeFilename(slugifyText(filename))}`,
    Body: file,
    ACL: 'public-read',
    ContentType: contentType,
    ContentDisposition: 'inline',
  })
    .promise()
    .then(data => data.Key)
    .catch(error => Logger.error(error));
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
          const proxiedLinks = fileKeys.filter(key => key).map(key => `${config.staticURL}/${key.replace(`${config.environment}/`, '')}`);

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

router.use(errorHandler);

module.exports = router;
