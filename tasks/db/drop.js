const mongoose = require('mongoose');
const connectToDB = require('../../utils/connect-to-db');
const Logger = require('../../services/logger');

connectToDB()
  .then(() => {
    mongoose.connection.db.dropDatabase(() => {
      Logger.success('Successfully dropped the database.');

      mongoose.disconnect();
      process.exit();
    });
  })
  .catch(error => Logger.error(error));
