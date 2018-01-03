const connectToDB = require('../../utils/connect-to-db');
const Logger = require('../../services/logger');
const models = require('../../models');

connectToDB()
  .then(() => models.user.create({
    login: 'poohitan',
    email: 'poohitan@gmail.com',
    password: '12345678',
    role: 'admin',
  }))
  .then(() => Logger.success('Successfully created a user'))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
