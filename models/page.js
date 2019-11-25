const model = require('../utils/model');
const slugifyText = require('../helpers/slugify-text');

module.exports = model('Page', {
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  path: { type: String, index: true, unique: true },
  private: { type: Boolean, default: false },
  customStyles: { type: String, default: '' },
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
      pre(next) {
        this.path = this.path || (this.title ? slugifyText(this.title) : this._id);

        next();
      },
    },
  },
});
