const Logger = require('logger');
const connectToDB = require('../../../utils/connect-to-db');
const models = require('../../../models');

async function updateImageLinks(model) {
  const docs = await model.find();

  return Promise.all(docs.map(doc => model.findOneAndUpdate({
    _id: doc._id,
  }, {
    body: doc.body.replace(/api\.poohitan\.com/g, 'static.poohitan.com'),
  }, {
    new: true,
  })));
}

connectToDB()
  .then(() => Promise.all([
    updateImageLinks(models.post),
    updateImageLinks(models.page),
    updateImageLinks(models.trashPost),
  ]))
  .then(() => Logger.success('Successfully migrated'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
