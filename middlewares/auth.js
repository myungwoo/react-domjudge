const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const secret = req.app.get('jwt-secret');
  const auth = req.headers.authorization;
  if (!auth){ next(); return; }
  const token = auth.split(' ')[1];

  req.user = null;
  try {
    // eslint-disable-next-line no-unused-vars
    let {iat, exp, iss, sub, ...rest} = jwt.verify(token, secret, {
      issuer: req.app.get('jwt-issuer'),
      subject: req.app.get('jwt-subject'),
    });
    req.user = rest;
  } catch (e) {
    // Token verification failed
  }
  next();
};
