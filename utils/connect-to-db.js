const mongoose = require('mongoose');
const { db } = require('../config').current;

mongoose.Promise = global.Promise;

module.exports = () => mongoose.connect(`mongodb://${db.host}:${db.port}/${db.name}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
