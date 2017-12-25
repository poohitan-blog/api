const model = require('../utils/model');

module.exports = model('User', {
  login: { type: String, index: true },
  email: { type: String, index: true },
  password: String,
  role: String,
});
