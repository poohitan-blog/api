const SSH = require('ssh2').Client; // eslint-disable-line
const Logger = require('../services/logger');

module.exports = server => command => new Promise((resolve, reject) => {
  const client = new SSH();

  Logger.log(`Started: ${command}`);

  client
    .on('ready', () => {
      client.exec(command, {
        pty: true,
      }, (err, stream) => {
        if (err) {
          return reject(err);
        }

        return stream
          .on('close', () => {
            Logger.success(`Finished: ${command}`);

            client.end();
            resolve();
          })
          .on('data', data => Logger.log(data.toString()))
          .stderr.on('data', data => Logger.log(data.toString()));
      });
    })
    .on('error', error => reject(error))
    .connect(server);
});
