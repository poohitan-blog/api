const Logger = require('logger');
const argon2 = require('argon2');
const connectToDB = require('../../utils/connect-to-db');
const models = require('../../models');

connectToDB()
  .then(async () => {
    try {
      const password = await argon2.hash('12345678');

      await models.user.create({
        login: 'poohitan',
        email: 'poohitan@gmail.com',
        password,
        role: 'admin',
      });

      Logger.success('Successfully created a user');
    } catch (error) {
      Logger.error(error);
    } finally {
      process.exit();
    }
  });
