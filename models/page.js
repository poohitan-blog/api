const model = require('../utils/model');
const slugifyText = require('../helpers/slugify-text');

module.exports = model('Page', {
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  slug: { type: String, index: true, unique: true },
  hidden: { type: Boolean, default: false },
  customStyles: { type: String, default: '' },
  customStylesProcessed: { type: String, default: '' },
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
  middlewares: {
    save: {
      pre() {
        this.slug = (this.slug || (this.title ? slugifyText(this.title) : this._id)).trim();
      },
    },
  },
});
