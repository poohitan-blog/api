const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const mongoosePaginate = require('mongoose-paginate');
const uuid = require('uuid');
const serialize = require('./serialize');

module.exports = (modelName, fields, { indexes = [], methods = {} } = {}) => {
  const schema = new mongoose.Schema(Object.assign({
    _id: {
      type: String,
      default: uuid.v4,
    },
  }, fields), {
    timestamps: true,
  });

  schema.plugin(mongooseDelete, { deletedAt: true });
  schema.plugin(mongoosePaginate);
  schema.method('serialize', serialize);
  Object.keys(methods).forEach((methodName) => {
    const method = methods[methodName];

    schema.method(methodName, method);
  });

  indexes.forEach(index => schema.index(...index));

  return mongoose.model(modelName, schema);
};
