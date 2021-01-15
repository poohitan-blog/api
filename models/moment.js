const model = require('../utils/model');

module.exports = model('Moment', {
  url: { type: String },
  caption: { type: String, default: '' },
  width: { type: Number },
  height: { type: Number },
  averageColor: { type: String },
  capturedAt: { type: Date, default: () => new Date() },
});
