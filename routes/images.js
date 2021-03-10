const express = require('express');
const aws = require('aws-sdk');
const Busboy = require('busboy');
const { transliterate } = require('transliteration');
const Logger = require('logger');

const config = require('../config').current;

const ImageProcessing = require('../services/image-processing');
const TranslatorText = require('../services/azure/translator-text');
const sanitizeFilename = require('../helpers/sanitize-filename');
const Guard = require('../middlewares/guard');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();
const spacesEndpoint = new aws.Endpoint(config.digitalOcean.spaces.endpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});

const { environment } = config;
const spacesName = config.digitalOcean.spaces.name;

async function upload(file, filename, contentType) {
  try {
    const data = await s3.upload({
      Bucket: spacesName,
      Key: `${environment}/images/${Date.now()}_${sanitizeFilename(transliterate(filename))}`,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType,
      ContentDisposition: 'inline',
    })
      .promise();

    return data.Key;
  } catch (error) {
    return Logger.error(error);
  }
}

async function processImage(file, filename, contentType, { analyze }) {
  const filePath = await upload(file, filename, contentType);
  const url = `${config.staticURL}/${filePath.replace(`${config.environment}/`, '')}`;

  if (!analyze) {
    return { url };
  }

  const [metadata, averageColor, caption] = await Promise.all([
    ImageProcessing.getMetadata(file)
      .catch((error) => Logger.error(error)),
    ImageProcessing.getAverageColor(file)
      .catch((error) => Logger.error(error)),
    ImageProcessing.getCaption(url)
      .catch((error) => Logger.error(error)),
  ]);

  const { width, height } = metadata;

  const captionUk = caption
    ? await TranslatorText.translate(caption, { to: 'uk' })
    : null;

  return {
    url,
    metadata: {
      averageColor,
      captionUk,
      captionEn: caption,
      originalWidth: width,
      originalHeight: height,
    },
  };
}

function manageUpload(req, { analyze = false } = {}) {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });
    const uploads = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
      const chunks = [];

      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);

        uploads.push(processImage(buffer, filename, mimeType, { analyze }));
      });
    });

    busboy.on('finish', async () => {
      try {
        const uploadResults = await Promise.all(uploads);

        const images = uploadResults
          .filter((item) => item.url);

        resolve(images);
      } catch (error) {
        reject(error);
      }
    });

    req.pipe(busboy);
  });
}

router.post('/', Guard.protectRoute, async (req, res, next) => {
  try {
    const images = await manageUpload(req);

    res.json(images.map((image) => image.url));
  } catch (error) {
    next(error);
  }
});

router.post('/froala', Guard.protectRoute, async (req, res, next) => {
  try {
    const [image] = await manageUpload(req, { analyze: true });

    res.json({
      link: image.url,
      ...image.metadata,
    });
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
