const router = require('express').Router();

const authMiddleware = require('../middlewares/auth');

const db = require('./../db');

router.use('/', authMiddleware);

router.use('/auth', require('./auth'));
router.get('/status', (req, res) => {
  // TODO: check domjudge api conn
  (async function(req, res){
    let db_conn = true;
    try{ await db.ping(); }
    catch(err){ db_conn = false; }
    res.send({
      pong: true,
      db_conn
    });
  })(req, res);
});
router.get('/', (req, res) => {
  res.send({result: 0, user: req.user});
});

router.use('/', (req, res) => {
  // 404 Not found for remaining requests
  res.sendStatus(404);
});

module.exports = router;
