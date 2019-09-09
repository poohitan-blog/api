const model = require('../utils/model');

module.exports = model('PostTranslation', {
  title: String,
  body: String,
  lang: String,
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
