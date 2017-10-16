const router = require('express').Router();

const authMiddleware = require('../middlewares/auth');

router.use('/', authMiddleware);

router.use('/auth', require('./auth'));
router.get('/', (req, res) => {
  res.send({result: 0, user: req.user});
});

router.use('/', (req, res) => {
  // 404 Not found for remaining requests
  res.send(404);
});

module.exports = router;
