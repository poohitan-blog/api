const model = require('../utils/model');
const slugifyText = require('../helpers/slugify-text');

const CUT_TAG = '<cut>';

module.exports = model('Post', {
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  body: { type: String, default: '' },
  path: { type: String, index: true, unique: true },
  tags: { type: [String], default: [] },
  views: { type: Number, default: 0 },
  private: { type: Boolean, default: false },
  customStyles: { type: String, default: '' },
  customStylesProcessed: { type: String, default: '' },
  imagesWidth: Number,
  publishedAt: { type: Date, default: () => new Date() },
  translations: { type: [{ type: String, ref: 'PostTranslation' }], default: [] },
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
      const cutBody = cutPosition > 0 ? body.slice(0, cutPosition).trim() : body;
      const hasTrailingOpenParagraph = cutBody.slice(-3) === '<p>';

      return hasTrailingOpenParagraph ? cutBody.slice(0, -3) : cutBody;
    },
  },
  middlewares: {
    save: {
      pre() {
        this.path = this.path || slugifyText(this.title);
      },
    },
  },
});
