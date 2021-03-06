const { argv } = require('yargs');
const { parse } = require('date-fns');
const Logger = require('logger');
const connectToDB = require('../utils/connect-to-db');
const models = require('../models');
const readDir = require('../utils/migration/read-dir');
const cleanHtml = require('../utils/migration/clean-html');
const reuploadImages = require('../utils/migration/migrate-images');

const { trashDir } = argv;

async function makePostObject(filename, fileContent) {
  Logger.log('Processing post', filename);

  const createdAt = parse(filename, 'yyyyMMdd_HHmmss').toDate();
  const body = await reuploadImages(fileContent);

  return {
    body: cleanHtml(body),
    createdAt,
  };
}

connectToDB()
  .then(() => readDir(trashDir))
  .then((trashPostFiles) => trashPostFiles.reduce((promiseChain, file) => promiseChain.then(() => {
    const { name, content } = file;

    return makePostObject(name, content)
      .then((trashPost) => models.trashPost.create(trashPost))
      .catch(() => Logger.error(`Failed to migrate ${name} trash post. You should migrate it manually.`));
  }), Promise.resolve()))
  .then(() => Logger.success('Successfully migrated trash'))
  .catch((error) => Logger.error(error))
  .then(() => process.exit());
