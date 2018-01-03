const { argv } = require('yargs'); // eslint-disable-line
const connectToDB = require('../../utils/connect-to-db');
const Logger = require('../../services/logger');
const slugifyText = require('../../helpers/slugify-text');
const models = require('../../models');

const readDir = require('../../utils/migration/read-dir');
const cleanHtml = require('../../utils/migration/clean-html');
const reuploadImages = require('../../utils/migration/reupload-images-in-html');

const { pagesDir } = argv;

async function makePageObject(filename, fileContent) {
  Logger.log('Processing page', filename);

  const title = filename;
  const path = slugifyText(title); // eslint-disable-line
  const body = await reuploadImages(fileContent);

  return {
    title,
    body: cleanHtml(body),
    path,
  };
}

connectToDB()
  .then(() => readDir(pagesDir))
  .then(pageFiles => pageFiles.reduce((promiseChain, file) => promiseChain.then(() => {
    const { name, content } = file;

    return makePageObject(name, content)
      .then(page => models.page.create(page))
      .catch(() => Logger.error(`Failed to migrate ${name} page. You should migrate it manually.`));
  }), Promise.resolve()))
  .then(() => Logger.success('Successfully migrated pages'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
