const mongoose = require('mongoose');
const uuid = require('uuid');

module.exports = (modelName, fields) => {
  const schema = new mongoose.Schema(Object.assign({
    _id: {
      type: String,
      default: uuid.v4,
    },
  }, fields), {
    timestamps: true,
  });

  return mongoose.model(modelName, schema);
};
