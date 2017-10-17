const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');
const db = require('./db');

const app = express();

app.set('port', process.env.PORT || 3001);
app.set('db_pool', db);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('jwt-secret', config.auth.secret);
app.set('jwt-expire', config.auth.token_expire);
app.set('jwt-issuer', config.auth.issuer);

app.use('/api', require('./api'));

if (process.env.NODE_ENV === 'production')
  app.use('/', express.static('client/build'));

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
