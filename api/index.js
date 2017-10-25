const router = require('express').Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});

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
      now: Date.now(),
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
    let verification_required = await db.configuration.getConfig('verification_required', 0);
    res.send(submissions.map(x => {
      let {...e} = x;
      if (verification_required && !e.verified)
        e.result = null;
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
    if (submissions.length === 0){ res.sendStatus(204); return; }
    let submission = submissions[0];
    let contests = await db.contest.getContestByCid(submission.cid);
    if (contests.length === 0){ res.sendStatus(500); return; }
    let contest = contests[0];
    let verification_required = await db.configuration.getConfig('verification_required', 0);
    if (submission.submittime >= contest.endtime || (verification_required && !submission.verified)){ res.json(null); return; }
    if (verification_required && !submission.verified)
      submission.result = null;
    let show_compile = await db.configuration.getConfig('show_compile', 2);
    if (show_compile !== 2 && (show_compile !== 1 || submission.result !== 'compile-error'))
      submission.output_compile = undefined;
    let show_sample = await db.configuration.getConfig('show_sample_output', 0);
    if (show_sample && submission.result !== 'compile-error')
      submission.sample_runs = await db.submission.getSampleRun(submitid);
    res.send(submission);
    try{
      await db.judging.setSeen(submission.judgingid);
    }catch(err){
      // ignore
    }
  })(req, res)
    .catch(() => res.sendStatus(500));
});

router.post('/problems', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {cid} = req.body;
  const {teamid} = req.user;
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  (async function(req, res) {
    let contest = (await db.contest.getContestByCidTeam(cid, teamid))[0];
    if (!contest){ res.sendStatus(204); return; }
    if (contest.starttime*1000 > Date.now()){ res.sendStatus(204); return; }
    res.send(await db.problem.getListByContest(cid));
  })(req, res);
});

router.post('/problems/with/text', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {cid} = req.body;
  const {teamid} = req.user;
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  (async function(req, res) {
    let contest = (await db.contest.getContestByCidTeam(cid, teamid))[0];
    if (!contest){ res.sendStatus(204); return; }
    if (contest.starttime*1000 > Date.now()){ res.sendStatus(204); return; }
    res.send(await db.problem.getListByContestWithText(cid));
  })(req, res);
});

router.post('/problem', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {cid, probid} = req.body;
  const {teamid} = req.user;
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  (async function(req, res) {
    let contest = (await db.contest.getContestByCidTeam(cid, teamid))[0];
    if (!contest){ res.sendStatus(204); return; }
    if (contest.starttime*1000 > Date.now()){ res.sendStatus(403); return; }
    let problem = (await db.problem.getByContest(probid, cid))[0];
    if (!problem){ res.sendStatus(204); return; }
    /* Only supports pdf */
    res.writeHead(200, {'Content-Type': 'application/pdf'});
    res.end(problem.problemtext, 'binary');
  })(req, res);
});

router.get('/languages', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  db.language.getList().then(val => res.send(val));
});

router.post('/submit', upload.array('files'), (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const files = req.files;
  const {cid, probid, langid} = req.body;
  const {teamid, username} = req.user;
  if (!(files.length > 0)){ res.sendStatus(400); return; }
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  if (!probid || isNaN(Number(probid))){ res.sendStatus(400); return; }
  if (!langid || typeof langid !== 'string'){ res.sendStatus(400); return; }
  (async function(req, res) {
    const maxfiles = await db.configuration.getConfig('sourcefiles_limit', 100);
    const maxsize = await db.configuration.getConfig('sourcesize_limit', 256);
    if (files.length > maxfiles){ res.sendStatus(400); return; }
    let totalsize = files.map(e => e.size).reduce((a, b) => a+b, 0);
    if (totalsize > maxsize*1024){ res.sendStatus(400); return; }
    const contests = await db.contest.getContestByCidTeam(cid, teamid);
    if (contests.length === 0){ res.sendStatus(400); return; }
    const contest = contests[0];
    if (contest.starttime*1000 > Date.now()){ res.sendStatus(400); return; }
    const problems = await db.problem.getByContest(probid, cid);
    if (problems.length === 0){ res.sendStatus(400); return; }
    const languages = await db.language.getById(langid);
    if (languages.length === 0){ res.sendStatus(400); return; }

    const conn = await new Promise((resolve, reject) => {
      db.pool.getConnection((err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
    await new Promise((resolve, reject) => {
      conn.query('START TRANSACTION', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
    try{
      const submitid = await db.submission.addSubmission(cid, teamid, probid, langid, conn);
      let promises = files.map((file, rank) => (
        db.submission.addSubmissionFile(submitid, file.originalname, rank, file.buffer.toString('utf-8'), conn)
      ));
      await Promise.all(promises);
      await new Promise((resolve, reject) => {
        conn.query('COMMIT', (err, res) => {
          if (err) reject(err);
          resolve(res);
        });
      });
      conn.end();
      res.send({success: true});
      try{
        await db.auditlog.addLog(cid, username, 'submission', submitid, 'added', 'via react');
      }catch(err){
        // ignore
      }
    }catch (err){
      await new Promise((resolve, reject) => {
        conn.query('ROLLBACK', (err, res) => {
          if (err) reject(err);
          resolve(res);
        });
      });
      conn.end();
      res.send({success: false});
    }
  })(req, res)
    .catch(() => res.send({success: false}));
});

router.post('/clarifications', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {teamid, teamname} = req.user;
  const {cid} = req.body;
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  (async function(req, res) {
    let contest = (await db.contest.getContestByCidTeam(cid, teamid))[0];
    if (!contest){ res.sendStatus(400); return; }
    let clarifications = await db.clarification.getListByCidTeam(cid, teamid);
    const categories = await db.configuration.getConfig('clar_categories', {'general':'General issue', 'tech':'Technical issue'});
    res.send(clarifications.map(e => {
      e.from = e.from || 'Jury';
      e.to = e.to || 'All';
      if (e.to === teamname) e.to = 'You';
      e.subject = (e.shortname && 'Problem '+e.shortname) || categories[e.category || 'general'];
      return e;
    }));
  })(req, res)
    .catch(() => res.sendStatus(500));
});

router.post('/clarifications/my', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {teamid, teamname} = req.user;
  const {cid} = req.body;
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  (async function(req, res) {
    let contest = (await db.contest.getContestByCidTeam(cid, teamid))[0];
    if (!contest){ res.sendStatus(400); return; }
    let clarifications = await db.clarification.getMyListByCidTeam(cid, teamid);
    const categories = await db.configuration.getConfig('clar_categories', {'general':'General issue', 'tech':'Technical issue'});
    res.send(clarifications.map(e => {
      if (e.from === teamname) e.from = 'You';
      e.to = e.to || 'Jury';
      e.subject = (e.shortname && 'Problem '+e.shortname) || categories[e.category || 'general'];
      return e;
    }));
  })(req, res)
    .catch(() => res.sendStatus(500));
});

router.post('/clarification', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {teamid} = req.user;
  const {clarid} = req.body;
  if (!clarid || isNaN(Number(clarid))){ res.sendStatus(400); return; }
  (async function(req, res) {
    let clarification = (await db.clarification.getByIdTeam(clarid, teamid))[0];
    if (!clarification){ res.sendStatus(401); return; }
    let respid = clarification.respid || clarid;
    let data = (await db.clarification.getNextByIdTeam(respid, teamid));
    const categories = await db.configuration.getConfig('clar_categories', {'general':'General issue', 'tech':'Technical issue'});
    const simplify = e => {
      let {clarid, cid, submittime, body, sender, category, probid} = e;
      let subject = (e.shortname && e.probname && `Problem ${e.shortname}: ${e.probname}`) || categories[e.category || 'general'];
      let from = e.from || 'Jury';
      let to = e.to || (!e.from && 'All') || 'Jury';
      if (e.sender) from += ` (t${e.sender})`;
      if (e.recipient) to += ` (t${e.recipient})`;
      return {clarid, cid, submittime, body, sender, category, probid, subject, from, to};
    };
    res.send({
      original: simplify(clarification),
      list: data.map(simplify),
    });
    try{
      await db.clarification.setRead(clarid, teamid);
    }catch(err){
      // ignore
    }
  })(req, res)
    .catch(() => res.sendStatus(500));
});

router.post('/clarification/send', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {teamid, username} = req.user;
  const {cid, subject, text} = req.body;
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  if (!text || typeof text !== 'string'){ res.sendStatus(400); return; }
  (async function(req, res) {
    let clarid;
    if (typeof subject === 'string'){
      const categories = await db.configuration.getConfig('clar_categories', {'general':'General issue', 'tech':'Technical issue'});
      if (!categories[subject]){ res.sendStatus(400); return; }
      clarid = await db.clarification.addByCategory(cid, teamid, subject, text);
    }else{
      const problem = (await db.problem.getByContest(subject, cid))[0];
      if (!problem){ res.sendStatus(400); return; }
      clarid = await db.clarification.addByProblem(cid, teamid, subject, text);
    }
    res.sendStatus(201);
    try{
      await db.auditlog.addLog(cid, username, 'clarification', clarid, 'added', 'via react');
    }catch(err){
      // ignore
    }
  })(req, res)
    .catch(() => res.sendStatus(500));
});

router.post('/scoreboard/my', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {teamid} = req.user;
  const {cid} = req.body;
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  (async function(req, res) {
    let contest = (await db.contest.getContestByCidTeam(cid, teamid))[0];
    if (!contest){ res.sendStatus(400); return; }
    if (contest.starttime*1000 > Date.now()){ res.sendStatus(400); return; }
    let team = (await db.team.getByTeamId(teamid))[0];
    if (!team){ res.sendStatus(400); return; }
    let affil = (await db.affiliation.getByAffilId(team.affilid))[0];
    let total = (await db.scoreboard.getTotalByTeam(cid, teamid))[0];
    let sortorder = (await db.team.getTeamCategoryByTeam(teamid))[0].sortorder;
    let rank = (await db.scoreboard.getBetterThan(cid, total.points, total.totaltime, sortorder)) + 1;
    // TODO: hard review
    // tie breaking
    if (total.points > 0){
      let tied = (await db.scoreboard.getTied(cid, total.points, total.totaltime, sortorder)).map(e => e.teamid);
      if (tied.length >= 1){
        let my_times = (await db.scoreboard.getCorrectProblemScoreList(cid, teamid)).map(e => e.totaltime);
        for (let tid of tied){
          let you = (await db.scoreboard.getCorrectProblemScoreList(cid, tid)).map(e => e.totaltime);
          for (let i=0;i<you.length;i++){
            if (you[i] < my_times[i]) rank++;
            if (you[i] !== my_times[i]) break;
          }
        }
      }
    }
    let firstsovletimes = (await db.scoreboard.getFirstSolveTime(cid, sortorder)).reduce((acc, cur) => {
      acc[cur.probid] = cur['MIN(totaltime)'];
      return acc;
    }, {});
    let detail = (await db.scoreboard.getProblemScoreList(cid, teamid)).map(e => {
      e.is_first = firstsovletimes[e.probid] === e.totaltime && e.is_correct;
      return e;
    });
    if (contest.freezetime && contest.freezetime*1000 <= Date.now() && (!contest.unfreezetime || contest.unfreezetime*1000 > Date.now()))
      rank = '?';
    res.send({points: total.points, totaltime: total.totaltime, rank, detail, team: {
      teamid: team.teamid,
      teamname: team.name,
      affilname: (affil && affil.name) || null,
      country: (affil && affil.country) || null,
      color: null,
    }});
  })(req, res)
    .catch(() => res.sendStatus(500));
});

router.post('/scoreboard', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  const {teamid} = req.user;
  const {cid} = req.body;
  const now = Date.now();
  if (!cid || isNaN(Number(cid))){ res.sendStatus(400); return; }
  (async function(req, res) {
    let contest = (await db.contest.getContestByCidTeam(cid, teamid))[0];
    if (!contest){ res.sendStatus(400); return; }
    if (contest.starttime*1000 > now){ res.sendStatus(204); return; }
    let target = 'public';
    if ((!contest.freezetime && contest.endtime <= now) ||
        (contest.unfreezetime && contest.unfreezetime <= now))
      target = 'jury';
    let [teams, problems, caches] = await Promise.all([
      db.team.getPublicList(cid),
      db.problem.getListByContest(cid),
      db.scoreboard.getScorecacheList(cid, target)
    ]);
    let sortorder_of_team = {};
    let firstsolve = {};
    let table = {};
    for (let team of teams){
      sortorder_of_team[team.teamid] = team.sortorder;
      firstsolve[team.sortorder] = {};
      table[team.teamid] = {points: 0, totaltime: team.penalty, solve_times: []};
      for (let problem of problems) table[team.teamid][problem.probid] = {
        probid: problem.probid, shortname: problem.shortname,
        submissions: 0, pending: 0, totaltime: 0, is_correct: 0, is_first: false
      };
    }
    let penalty1 = await db.configuration.getConfig('penalty_time', 20);
    // caches must order by totaltime
    for (let cache of caches){
      let row = table[cache.teamid];
      if (!row) continue;
      let cell = row[cache.probid];
      if (!cell) continue;
      const sortorder = sortorder_of_team[cache.teamid];
      if (cache.is_correct && !cell.is_correct){
        if (!firstsolve[sortorder][cache.probid])
          firstsolve[sortorder][cache.probid] = cache.totaltime;
        row.points++;
        row.totaltime += cache.totaltime + penalty1 * (cache.submissions - 1);
        row.solve_times.push(cache.totaltime);
        if (cache.totaltime === firstsolve[sortorder][cache.probid])
          cell.is_first = true;
      }
      cell.submissions = cache.submissions;
      cell.pending = cache.pending;
      cell.totaltime = cache.totaltime;
      cell.is_correct = cache.is_correct;
    }
    let ret = [];
    for (let team of teams){
      let row = table[team.teamid];
      row.team = team;
      row.detail = [];
      for (let problem of problems){
        row.detail.push(row[problem.probid]);
        delete row[problem.probid];
      }
      ret.push(row);
    }
    const my_cmp = (a, b) => {
      if (a.team.sortorder !== b.team.sortorder) return a.team.sortorder - b.team.sortorder;
      if (a.points !== b.points) return b.points-a.points;
      if (a.totaltime !== b.totaltime) return a.totaltime-b.totaltime;
      for (let i=a.points-1;i>=0;i--)
        if (a.solve_times[i] !== b.solve_times[i])
          return a.solve_times[i] - b.solve_times[i];
      return 0;
    };
    ret.sort(my_cmp);
    let rank = 1, bef = null;
    for (let row of ret){
      if (bef && bef.team.sortorder !== row.team.sortorder) rank = 1;
      row.rank = rank;
      if (bef && !my_cmp(bef, row)) row.rank = bef.rank;
      bef = row;
      rank++;
    }
    for (let row of ret) delete row.solve_times;
    res.send({scoreboard: ret, problems});
  })(req, res)
    .catch(() => res.sendStatus(500));
});

router.use('/', (req, res) => {
  // 404 Not found for remaining requests
  res.sendStatus(404);
});

module.exports = router;
