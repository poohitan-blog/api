const SSH = require('ssh2').Client; // eslint-disable-line

module.exports = server => command => new Promise((resolve, reject) => {
  const client = new SSH();

  console.log(`Started: ${command}`);

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
            console.log(`Finished: ${command}`);

            client.end();
            resolve();
          })
          .on('data', data => console.log(data.toString()))
          .stderr.on('data', data => console.error(data.toString()));
      });
    })
    .on('error', error => reject(error))
    .connect(server);
});
