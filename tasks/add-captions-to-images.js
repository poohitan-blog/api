const { argv } = require('yargs'); // eslint-disable-line
const Logger = require('logger');

const connectToDB = require('../utils/connect-to-db');
const models = require('../models');
const ImageProcessing = require('../services/image-processing');
const TranslatorText = require('../services/azure/translator-text');

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

function processOneImage(imageLink) {
  return ImageProcessing.getCaption(imageLink)
    .then((caption) => {
      if (!caption) {
        return {};
      }

      return TranslatorText.translate(caption, { to: 'uk' })
        .then((translatedCaption) => {
          Logger.log(`Got captions for ${imageLink}: "${caption}", "${translatedCaption}"`);

          return { captionEn: caption, captionUk: translatedCaption };
        });
    });
}

function injectMetadata(html, link, { captionEn, captionUk }) {
  if (!captionEn) {
    return html;
  }

  let newHtml = `src="${link}"`;

  if (captionEn) {
    newHtml += `data-captionen="${captionEn}"`;
  }

  if (captionUk) {
    newHtml += `data-captionuk="${captionUk}"`;
  }

  return html.replace(`src="${link}"`, newHtml);
}

async function processOnePost(post) {
  Logger.log(`Started processing post "${post.title}"`);

  const translations = await models.postTranslation.find({ _id: { $in: post.translations } });

  const imageLinks = getImagesFromHTML(post.body);

  if (!imageLinks.length) {
    Logger.log(`Post "${post.title}" has no images`);

    return Promise.resolve();
  }

  return imageLinks.reduce((imagesPromiseChain, imageLink) => imagesPromiseChain
    .then(() => processOneImage(imageLink)
      .then(({ captionEn, captionUk }) => {
        post.body = injectMetadata(post.body, imageLink, { captionEn, captionUk }); // eslint-disable-line

        translations.forEach((translation) => {
          translation.body = injectMetadata(translation.body, imageLink, { captionEn }); // eslint-disable-line
        });
      })
      .then(() => new Promise((resolve) => {
        setTimeout(() => resolve(), 3000);
      }))
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
      .then(({ captionEn, captionUk }) => {
        trashPost.body = injectMetadata(trashPost.body, imageLink, { captionEn, captionUk }); // eslint-disable-line
      })
      .catch(error => Logger.error(error))), Promise.resolve())
    .then(() => trashPost.save())
    .then(() => Logger.success(`Finished processing post ${trashPost._id}`))
    .then(() => new Promise((resolve) => {
      setTimeout(() => resolve(), 3000);
    }));
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
