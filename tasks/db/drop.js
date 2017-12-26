const mongoose = require('mongoose');
const connectToDB = require('../../utils/connect-to-db');

connectToDB()
  .then(() => {
    mongoose.connection.db.dropDatabase(() => {
      console.log('Successfully dropped the database.');

      mongoose.disconnect();
      process.exit();
    });
  })
  .catch(error => console.error(error));
