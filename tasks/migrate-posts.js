const { argv } = require('yargs');
const Logger = require('logger');
const connectToDB = require('../utils/connect-to-db');
const slugifyText = require('../helpers/slugify-text');
const models = require('../models');
const readDir = require('../utils/migration/read-dir');
const cleanHtml = require('../utils/migration/clean-html');
const reuploadImages = require('../utils/migration/migrate-images');

const { postsDir, tagsDir } = argv;

const regexes = {
  id: /\$post\['id'\]='((?:.|\s)*?)';/,
  title: /\$post\['title'\]='((?:.|\s)*?)';/,
  body: /\$post\['text'\]='((?:.|\s)*?)';/,
};

async function makePostObject(filename, postFileContent, tagFiles) {
  Logger.log('Processing post', filename);

  const id = postFileContent.match(regexes.id)[1];
  const title = postFileContent.match(regexes.title)[1];
  const path = slugifyText(title); // eslint-disable-line
  const body = await reuploadImages(postFileContent.match(regexes.body)[1]);
  const publishedAt = new Date(Number(filename) * 1000);
  const tagFile = tagFiles.find((file) => file.name === id);
  const tags = tagFile ? tagFile.content.split(',').map((tag) => tag.trim()) : [];

  return {
    title,
    body: cleanHtml(body),
    path,
    tags,
    publishedAt,
  };
}

connectToDB()
  .then(() => Promise.all([
    readDir(postsDir),
    readDir(tagsDir),
  ]))
  .then(([postFiles, tagFiles]) => postFiles.reduce((promiseChain, file) => promiseChain.then(() => {
    const { name, content } = file;

    return makePostObject(name, content, tagFiles)
      .then((post) => models.post.create(post))
      .catch(() => Logger.error(`Failed to migrate ${name} post. You should migrate it manually.`));
  }), Promise.resolve()))
  .then(() => Logger.success('Successfully migrated posts'))
  .catch((error) => Logger.error(error))
  .then(() => process.exit());
