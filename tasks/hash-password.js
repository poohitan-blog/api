const { argv } = require('yargs');
const argon2 = require('argon2');

const password = argv.password || argv.p || argv._[0];

argon2.hash(password.toString())
  .then((hash) => console.log(hash))
  .then(() => process.exit(0));
