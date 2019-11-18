const express = require('express');
const aws = require('aws-sdk');
const Busboy = require('busboy');
const { transliterate } = require('transliteration');
const Logger = require('logger');

const config = require('../config').current;

const sanitizeFilename = require('../helpers/sanitize-filename');
const getImageMedatada = require('../helpers/get-image-metadata');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();
const spacesEndpoint = new aws.Endpoint(config.digitalOcean.spaces.endpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});

const { environment } = config;
const spacesName = config.digitalOcean.spaces.name;

function uploadImage(file, filename, contentType) {
  return s3.upload({
    Bucket: spacesName,
    Key: `${environment}/images/${Date.now()}_${sanitizeFilename(transliterate(filename))}`,
    Body: file,
    ACL: 'public-read',
    ContentType: contentType,
    ContentDisposition: 'inline',
  })
    .promise()
    .then(data => data.Key)
    .catch(error => Logger.error(error));
}

async function processImage(file, filename, contentType) {
  return Promise.all([
    uploadImage(file, filename, contentType),
    getImageMedatada(file),
  ])
    .then(([url, metadata]) => ({
      url,
      metadata,
    }));
}

function manageUpload(req) {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });
    const uploads = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
      const chunks = [];

      file.on('data', chunk => chunks.push(chunk));
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);

        uploads.push(processImage(buffer, filename, mimeType));
      });
    });

    busboy.on('finish', () => {
      Promise.all(uploads)
        .then((uploadResults) => {
          const images = uploadResults
            .filter(item => item.url)
            .map(({ url, metadata }) => {
              const proxiedURL = `${config.staticURL}/${url.replace(`${config.environment}/`, '')}`;
              const { width, height, averageColor } = metadata;

              return {
                url: proxiedURL,
                metadata: {
                  originalWidth: width,
                  originalHeight: height,
                  averageColor,
                },
              };
            });

          resolve(images);
        })
        .catch(reject);
    });

    req.pipe(busboy);
  });
}

router.post('/', routeProtector, (req, res, next) => {
  manageUpload(req)
    .then(images => res.json(images.map(image => image.url)))
    .catch(next);
});

router.post('/froala', routeProtector, (req, res, next) => {
  manageUpload(req)
    .then(([image]) => res.json({
      link: image.url,
      ...image.metadata,
    }))
    .catch(next);
});

router.use(errorHandler);

module.exports = router;
