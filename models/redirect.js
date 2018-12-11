const model = require('../utils/model');

module.exports = model('Redirect', {
  from: String,
  to: String,
  enabled: { type: Boolean, default: true },
});
