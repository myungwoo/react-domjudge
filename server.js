const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');

const app = express();

app.set('port', process.env.PORT || 3001);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('jwt-secret', config.auth.secret);
app.set('jwt-expire', config.auth.token_expire);
app.set('jwt-issuer', config.auth.issuer);

app.use('/api', require('./api'));

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
