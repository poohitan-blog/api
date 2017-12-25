const express = require('express');
const HttpStatus = require('http-status-codes');

const corsHandler = require('./middlewares/cors-handler');
const config = require('./config').current;
const connectToDB = require('./utils/connect-to-db');
const routes = require('./routes');

const app = express();

app.use(corsHandler);

app.get('/', (req, res) => {
  res.sendStatus(HttpStatus.OK);
});

Object.keys(routes).forEach((route) => {
  const router = routes[route];

  if (typeof router === 'function') {
    app.use(`/${route}`, router);
  }
});

connectToDB()
  .then(() => {
    app.listen(config.port);

    console.log('Listening on port', config.port);
  });
