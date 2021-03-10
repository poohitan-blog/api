const express = require('express');
const aws = require('aws-sdk');
const Busboy = require('busboy');
const Logger = require('logger');
const { transliterate } = require('transliteration');

const config = require('../config').current;

const sanitizeFilename = require('../helpers/sanitize-filename');
const Guard = require('../middlewares/guard');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();
const spacesEndpoint = new aws.Endpoint(config.digitalOcean.spaces.endpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});

async function upload(file, filename, contentType) {
  try {
    const data = await s3.upload({
      Bucket: config.digitalOcean.spaces.name,
      Key: `${config.environment}/files/${Date.now()}_${sanitizeFilename(transliterate(filename))}`,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType,
      ContentDisposition: 'attachment',
    })
      .promise();

    return data.Key;
  } catch (error) {
    return Logger.error(error);
  }
}

function manageUpload(req) {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });
    const uploads = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
      uploads.push(upload(file, filename, mimeType));
    });

    busboy.on('finish', async () => {
      try {
        const fileKeys = await Promise.all(uploads);

        const proxiedLinks = fileKeys
          .filter((key) => key)
          .map((key) => `${config.staticURL}/${key.replace(`${config.environment}/`, '')}`);

        resolve(proxiedLinks);
      } catch (error) {
        reject(error);
      }
    });

    req.pipe(busboy);
  });
}

router.post('/', Guard.protectRoute, async (req, res, next) => {
  try {
    const links = await manageUpload(req);

    res.json(links);
  } catch (error) {
    next(error);
  }
});

router.post('/froala', Guard.protectRoute, async (req, res, next) => {
  try {
    const [link] = await manageUpload(req);

    res.json({ link });
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
