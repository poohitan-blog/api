const model = require('../utils/model');
const slugifyText = require('../helpers/slugify-text');

module.exports = model('Page', {
  title: String,
  body: String,
  path: { type: String, index: true, unique: true },
  private: { type: Boolean, default: false },
  customStyles: String,
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
