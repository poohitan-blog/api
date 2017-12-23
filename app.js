const express = require('express');
const config = require('./config').current;

const app = express();

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(config.port);

console.log('Listening on port', config.port);
