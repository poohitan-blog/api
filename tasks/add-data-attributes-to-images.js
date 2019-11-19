const { argv } = require('yargs'); // eslint-disable-line
const request = require('request');
const Logger = require('logger');

const connectToDB = require('../utils/connect-to-db');
const models = require('../models');
const getImageMetadata = require('../helpers/get-image-metadata');

const { post: postPath, trash } = argv;

function getImagesFromHTML(html) {
  const regex = /<img(?:[^<>]+?)src="(https?:\/\/[^"]+?)"[^<>]*?\/?>/gi;
  const images = [];
  let match = regex.exec(html);

  while (match) {
    images.push(match[1]);

    match = regex.exec(html);
  }

  return images;
}

function downloadImage(link) {
  return new Promise((resolve, reject) => {
    Logger.log('Downloading', link);

    request({
      url: link,
      encoding: null,
      timeout: 10000,
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      return resolve(body);
    });
  });
}

function processOneImage(imageLink) {
  return downloadImage(imageLink)
    .then(image => getImageMetadata(image))
    .then((metadata) => {
      const { width, height, averageColor } = metadata;

      Logger.log(`Got metadata from ${imageLink}: ${JSON.stringify({ width, height, averageColor })}`);

      return { width, height, averageColor };
    });
}

function injectMetadata(html, link, { width, height, averageColor }) {
  return html.replace(`"${link}"`, `"${link}" data-originalwidth="${width}" data-originalheight="${height}" data-averagecolor="${averageColor}"`);
}

async function processOnePost(post) {
  Logger.log(`Started processing post "${post.title}"`);

  const translations = await models.postTranslation.find({ _id: { $in: post.translations } });

  const translationBodies = translations.map(translation => translation.body);
  const allBodies = [post.body, ...translationBodies];

  const imageLinks = getImagesFromHTML(allBodies.join(''))
    .filter((link, index, array) => array.indexOf(link) === index);

  if (!imageLinks.length) {
    Logger.log(`Post "${post.title}" has no images`);

    return Promise.resolve();
  }

  return imageLinks.reduce((imagesPromiseChain, imageLink) => imagesPromiseChain
    .then(() => processOneImage(imageLink)
      .then(({ width, height, averageColor }) => {
        post.body = injectMetadata(post.body, imageLink, { width, height, averageColor }); // eslint-disable-line

        translations.forEach((translation) => {
          translation.body = injectMetadata(translation.body, imageLink, { width, height, averageColor }); // eslint-disable-line
        });
      })
      .catch(error => Logger.error(error))), Promise.resolve())
    .then(() => Promise.all([
      post.save(),
      ...translations.map(translation => translation.save()),
    ]))
    .then(() => Logger.success(`Finished processing post "${post.title}"`));
}

function processOneTrashPost(trashPost) {
  Logger.log(`Started processing trash post ${trashPost._id}`);

  const imageLinks = getImagesFromHTML(trashPost.body);

  if (!imageLinks.length) {
    Logger.log(`Trash post ${trashPost._id} has no images`);

    return Promise.resolve();
  }

  return imageLinks.reduce((imagesPromiseChain, imageLink) => imagesPromiseChain
    .then(() => processOneImage(imageLink)
      .then(({ width, height, averageColor }) => {
        trashPost.body = injectMetadata(trashPost.body, imageLink, { width, height, averageColor }); // eslint-disable-line
      })
      .catch(error => Logger.error(error))), Promise.resolve())
    .then(() => Promise.all([
      trashPost.save(),
    ]))
    .then(() => Logger.success(`Finished processing post ${trashPost._id}`));
}

connectToDB()
  .then(async () => {
    if (trash) {
      const trashPosts = await models.trashPost.find();

      return trashPosts.reduce((postsPromiseChain, trashPost) => postsPromiseChain
        .then(() => processOneTrashPost(trashPost)), Promise.resolve());
    } else if (postPath) {
      const posts = await models.post.find({ path: postPath });

      return posts.reduce((postsPromiseChain, post) => postsPromiseChain
        .then(() => processOnePost(post)), Promise.resolve());
    }

    return Promise.resolve();
  })
  .catch(error => Logger.error(error))
  .then(() => process.exit(0));
