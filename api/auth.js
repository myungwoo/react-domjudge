const router = require('express').Router();
const jwt = require('jsonwebtoken');

router.get('/login', (req, res) => {
  // TODO: Real DOMJudge login implement
  const secret = req.app.get('jwt-secret');
  try{
    const token = jwt.sign({
      username: 'myungwoo',
      teamname: 'Let Myungwoo go WF'
    },
    secret,
    {
      expiresIn: req.app.get('jwt-expire'),
      issuer: req.app.get('jwt-issuer')
    });
    res.send({
      success: true,
      token
    });
  } catch (e) {
    res.send({
      success: false,
      error: e
    });
  }
});

router.get('/user', (req, res) => {
  res.json(req.user);
});

module.exports = router;
