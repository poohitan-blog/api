const model = require('../utils/model');

module.exports = model('Page', {
  title: String,
  body: String,
  path: { type: String, index: true },
});
