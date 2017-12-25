const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const uuid = require('uuid');
const serialize = require('./serialize');

module.exports = (modelName, fields) => {
  const schema = new mongoose.Schema(Object.assign({
    _id: {
      type: String,
      default: uuid.v4,
    },
  }, fields), {
    timestamps: true,
  });

  schema.plugin(mongooseDelete, { deletedAt: true });
  schema.method('serialize', serialize);

  return mongoose.model(modelName, schema);
};
