const model = require('../utils/model');

module.exports = model('TrashPost', {
  body: String,
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
