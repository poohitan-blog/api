const model = require('../utils/model');

module.exports = model('Post', {
  title: String,
  body: String,
  path: String,
  tags: [String],
  draft: Boolean,
  publishedAt: Date,
});
