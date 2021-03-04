const model = require('../utils/model');
const generateShortId = require('../helpers/generate-shortid');

module.exports = model('TrashPost', {
  body: {
    type: String,
    default: '',
  },
  shortId: {
    type: String,
    default: generateShortId,
    index: true,
  },
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
