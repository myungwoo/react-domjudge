const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const secret = req.app.get('jwt-secret');
  const token = req.headers['x-access-token'];

  req.user = null;
  try {
    req.user = jwt.verify(token, secret, {
      issuer: req.app.get('jwt-issuer')
    });
  } catch (e) {
    // Token verification failed
  }
  next();
};
