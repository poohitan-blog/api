const model = require('../utils/model');

module.exports = model('Post', {
  title: String,
  body: String,
  path: { type: String, index: true },
  tags: [String],
  private: { type: Boolean, default: false },
  publishedAt: Date,
}, {
  indexes: [
    [
      { title: 'text', body: 'text', tags: 'text' },
      {
        weights: {
          title: 10, body: 5,
        },
      },
    ],
  ],
});
