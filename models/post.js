const model = require('../utils/model');

const CUT_TAG = '<cut>';

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
  methods: {
    getCutBody() {
      const { body } = this;
      const cutPosition = body.indexOf(CUT_TAG);

      return cutPosition > 0 ? body.slice(0, cutPosition) : body;
    },
  },
});
