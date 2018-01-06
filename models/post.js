const model = require('../utils/model');
const slugifyText = require('../helpers/slugify-text');

const CUT_TAG = '<cut>';

module.exports = model('Post', {
  title: String,
  body: String,
  path: { type: String, index: true, unique: true },
  tags: { type: [String], default: [] },
  private: { type: Boolean, default: false },
  publishedAt: { type: Date, default: () => new Date() },
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
  middlewares: {
    save: {
      pre(next) {
        this.path = this.path || slugifyText(this.title);

        next();
      },
    },
  },
});
