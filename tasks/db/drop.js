const mongoose = require('mongoose');
const Logger = require('logger');
const connectToDB = require('../../utils/connect-to-db');

connectToDB()
  .then(() => {
    mongoose.connection.db.dropDatabase(() => {
      Logger.success('Successfully dropped the database.');

      mongoose.disconnect();
      process.exit();
    });
  })
  .catch(error => Logger.error(error));
