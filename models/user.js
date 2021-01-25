const model = require('../utils/model');

module.exports = model('User', {
  login: { type: String, index: true },
  email: { type: String, index: true },
  password: { type: String },
  role: { type: String, default: 'user' },
  isAlive: { type: Boolean, default: true },
});
