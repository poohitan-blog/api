const { argv } = require('yargs'); // eslint-disable-line
const connectToDB = require('../../utils/connect-to-db');
const Logger = require('../../services/logger');
const slugifyText = require('../../helpers/slugify-text');
const models = require('../../models');

const readDir = require('../../utils/read-dir');

const { pagesDir } = argv;

function preparePageBody(html) {
  return html.replace(/<br><br>/g, '</p><p>').replace(/<br>/g, '');
}

function makePageObject(filename, fileContent) {
  const title = filename;
  const path = slugifyText(title); // eslint-disable-line
  const body = fileContent;

  return {
    title,
    body: preparePageBody(body),
    path,
  };
}

connectToDB()
  .then(() => readDir(pagesDir))
  .then((pageFiles) => {
    const objects = pageFiles.map(({ name, content }) => makePageObject(name, content));

    return objects;
  })
  .then(pages => Promise.all(pages.map(page => models.page.create(page))))
  .then(() => Logger.success('Successfully migrated pages'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
