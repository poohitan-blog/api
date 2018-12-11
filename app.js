const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Logger = require('logger');

const config = require('./config').current;
const connectToDB = require('./utils/connect-to-db');
const corsHandler = require('./middlewares/cors-handler');
const queryParser = require('./middlewares/query-parser');
const authParser = require('./middlewares/auth-parser');
const errorHandler = require('./middlewares/error-handler');
const routes = require('./routes');

const app = express();

app.use(bodyParser.json({ type: 'application/json', limit: '50mb' }));
app.use(cookieParser());
app.use(queryParser);

app.use(Logger.request);
app.use(corsHandler);
app.use(authParser);

app.get('/', (req, res) => {
  res.send('Ну привіт.');
});

Object.keys(routes).forEach((route) => {
  const router = routes[route];

  if (typeof router === 'function') {
    app.use(`/${route}`, router);
  }
});

app.use(errorHandler);

connectToDB()
  .then(() => {
    app.listen(config.port);

    mongoose.set('debug', Logger.query);

    Logger.log('Listening on port', config.port);
  })
  .catch(error => Logger.error(error));
