const express = require('express');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const config = require('./config').current;
const connectToDB = require('./utils/connect-to-db');
const corsHandler = require('./middlewares/cors-handler');
const queryParser = require('./middlewares/query-parser');
const routes = require('./routes');
const Logger = require('./services/logger');

const app = express();

app.use(bodyParser.json());
app.use(queryParser);

app.use(Logger.request);
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

    mongoose.set('debug', Logger.query);

    console.log('Listening on port', config.port);
  });
