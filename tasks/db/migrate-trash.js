const { argv } = require('yargs'); // eslint-disable-line
const moment = require('moment');
const connectToDB = require('../../utils/connect-to-db');
const Logger = require('../../services/logger');
const models = require('../../models');

const readDir = require('../../utils/read-dir');

const { trashDir } = argv;

function preparePostBody(html) {
  return html.replace(/<br><br>/g, '</p><p>').replace(/<br>/g, '');
}

function makePostObject(filename, fileContent) {
  const createdAt = moment(filename, 'YYYYMMDD_HHmmss').toDate();
  const body = fileContent;

  return {
    body: preparePostBody(body),
    createdAt,
  };
}

connectToDB()
  .then(() => readDir(trashDir))
  .then((trashPostFiles) => {
    const objects = trashPostFiles.map(({ name, content }) => makePostObject(name, content));

    return objects;
  })
  .then(trashPosts => Promise.all(trashPosts.map(trashPost => models.trashPost.create(trashPost))))
  .then(() => Logger.success('Successfully migrated trash'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
