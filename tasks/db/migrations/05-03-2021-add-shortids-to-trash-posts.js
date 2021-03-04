const Logger = require('logger');
const connectToDB = require('../../../utils/connect-to-db');
const models = require('../../../models');
const generateShortId = require('../../../helpers/generate-shortid');

connectToDB()
  .then(() => models.trashPost.find({}))
  .then(trashPosts => Promise.all(trashPosts.map((trashPost) => {
    trashPost.shortId = generateShortId(); // eslint-disable-line

    Logger.log(`Adding short id ${trashPost.shortId} to ${trashPost.id}`);

    return trashPost.save();
  })))
  .then(() => Logger.success('Successfully migrated'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
