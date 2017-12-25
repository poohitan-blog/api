const model = require('../utils/model');

module.exports = model('Post', {
  title: String,
  body: String,
  path: { type: String, index: true },
  tags: [String],
  draft: Boolean,
  publishedAt: Date,
});
