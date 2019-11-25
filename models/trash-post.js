const model = require('../utils/model');

module.exports = model('TrashPost', {
  body: { type: String, default: '' },
}, {
  indexes: [
    [
      { body: 'text' },
      {
        weights: {
          body: 5,
        },
      },
    ],
  ],
});
