const model = require('../utils/model');

module.exports = model('PostTranslation', {
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  body: { type: String, default: '' },
  lang: { type: String, default: '' },
  hidden: { type: Boolean, default: false },
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
