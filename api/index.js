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

router.get('/config', (req, res) => {
  db.configuration.getList().then(val => {
    res.send(val.map(x => {
      let {...e} = x;
      e.value = JSON.parse(x.value);
      return e;
    }));
  });
});

router.get('/contests', (req, res) => {
  if (req.user && req.user.teamid){
    db.contest.getListByTeam(req.user.teamid).then(val => {
      res.send(val);
    });
  }else{
    db.contest.getPublicList().then(val => {
      res.send(val);
    });
  }
});

router.post('/submissions', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {cid} = req.body;
  const {teamid} = req.user;
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  (async function(req, res){
    let contests = await db.contest.getContestByCid(cid);
    if (contests.length === 0){
      res.send([]);
      return;
    }
    let contest = contests[0];
    let submissions = await db.submission.getListByTeamContest(cid, teamid);
    res.send(submissions.map(x => {
      let {...e} = x;
      if (e.submittime >= contest.endtime)
        e.result = 'too-late';
      return e;
    }));
  })(req, res);
});

router.post('/submission', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {submitid} = req.body;
  const {teamid} = req.user;
  if (!submitid || isNaN(Number(submitid))){ res.sendStatus(400); return; }
  (async function(req, res){
    let submissions = await db.submission.getDetailByTeam(submitid, teamid);
    if (submissions.length === 0){ res.json(null); return; }
    let submission = submissions[0];
    let contests = await db.contest.getContestByCid(submission.cid);
    if (contests.length === 0){ res.sendStatus(500); return; }
    let contest = contests[0];
    if (submission.submittime >= contest.endtime){ res.json(null); return; }
    res.send(submission);
  })(req, res);
});

router.use('/', (req, res) => {
  // 404 Not found for remaining requests
  res.sendStatus(404);
});

module.exports = router;
