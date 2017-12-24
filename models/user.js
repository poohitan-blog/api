const model = require('../utils/model');

module.exports = model('User', {
  login: String,
  email: String,
  password: String,
  role: String,
});
