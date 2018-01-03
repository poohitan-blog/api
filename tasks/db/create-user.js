const { argv } = require('yargs'); // eslint-disable-line
const moment = require('moment');
const connectToDB = require('../../utils/connect-to-db');
const Logger = require('../../services/logger');
const models = require('../../models');
const readDir = require('../../utils/migration/read-dir');
const cleanHtml = require('../../utils/migration/clean-html');
const reuploadImages = require('../../utils/migration/reupload-images-in-html');

const { trashDir } = argv;

async function makePostObject(filename, fileContent) {
  Logger.log('Processing post', filename);

  const createdAt = moment.utc(filename, 'YYYYMMDD_HHmmss').toDate();
  const body = await reuploadImages(fileContent);

  return {
    body: cleanHtml(body),
    createdAt,
  };
}

connectToDB()
  .then(() => models.user.create({
    login: 'poohitan',
    email: 'poohitan@gmail.com',
    password: '12345678',
    role: 'admin',
  }))
  .then(() => Logger.success('Successfully created a user'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
