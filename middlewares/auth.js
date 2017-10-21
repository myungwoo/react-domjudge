const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const secret = req.app.get('jwt-secret');
  const token = req.headers['x-access-token'];

  req.user = null;
  try {
    // eslint-disable-next-line no-unused-vars
    let {iat, exp, iss, ...rest} = jwt.verify(token, secret, {
      issuer: req.app.get('jwt-issuer'),
      subject: req.app.get('jwt-subject'),
    });
    req.user = rest;
  } catch (e) {
    // Token verification failed
  }
  next();
};
