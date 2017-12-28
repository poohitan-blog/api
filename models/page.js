const model = require('../utils/model');

module.exports = model('Page', {
  title: String,
  body: String,
  path: { type: String, index: true },
  private: { type: Boolean, default: false },
}, {
  indexes: [
    [
      { title: 'text', body: 'text' },
      {
        weights: {
          title: 10, body: 5,
        },
      },
    ],
  ],
});
