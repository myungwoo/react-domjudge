const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');
const db = require('./db');

const app = express();

app.set('port', process.env.PORT || 3001);
app.set('db_pool', db);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({limit: config.express.max_body_size}));

// Move configuration to app value
app.set('jwt-secret', config.auth.secret);
app.set('jwt-expire', config.auth.token_expire);
app.set('jwt-issuer', config.auth.issuer);
app.set('jwt-subject', config.auth.subject);
app.set('domjudge-allow-submitted-files', config.domjudge.allow_view_submitted_files);

app.use('/api', require('./api'));

if (process.env.NODE_ENV === 'production')
  app.use('/', express.static('client/build'));

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error.message); // eslint-disable-line no-console
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
