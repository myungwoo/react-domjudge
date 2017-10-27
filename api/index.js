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
    let contest = (await db.contest.getContestByCid(cid))[0];
    if (!contest){ res.send([]); return; }
    let [submissions, verification_required] = await Promise.all([
      db.submission.getListByTeamContest(cid, teamid),
      db.configuration.getConfig('verification_required', 0),
    ]);
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
    let submission = (await db.submission.getDetailByTeam(submitid, teamid))[0];
    if (!submission){ res.sendStatus(204); return; }
    let contest = (await db.contest.getContestByCid(submission.cid))[0];
    if (!contest){ res.sendStatus(500); return; }
    let [verification_required, show_compile, show_sample] = await Promise.all([
      db.configuration.getConfig('verification_required', 0),
      db.configuration.getConfig('show_compile', 2),
      db.configuration.getConfig('show_sample_output', 0),
    ]);
    if (submission.submittime >= contest.endtime || (verification_required && !submission.verified)){ res.json(null); return; }
    if (verification_required && !submission.verified)
      submission.result = null;
    if (show_compile !== 2 && (show_compile !== 1 || submission.result !== 'compile-error'))
      submission.output_compile = undefined;
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
    if (!contest){ res.sendStatus(400); return; }
    if (contest.starttime*1000 > Date.now()){ res.json(null); return; }
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
    if (!contest){ res.sendStatus(400); return; }
    if (contest.starttime*1000 > Date.now()){ res.json(null); return; }
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
    const [maxfiles, maxsize] = await Promise.all([
      db.configuration.getConfig('sourcefiles_limit', 100),
      db.configuration.getConfig('sourcesize_limit', 256),
    ]);
    if (files.length > maxfiles){ res.sendStatus(400); return; }
    let totalsize = files.map(e => e.size).reduce((a, b) => a+b, 0);
    if (totalsize > maxsize*1024){ res.sendStatus(400); return; }
    const contest = (await db.contest.getContestByCidTeam(cid, teamid))[0];
    if (!contest){ res.sendStatus(400); return; }
    if (contest.starttime*1000 > Date.now()){ res.sendStatus(400); return; }
    const [problems, languages] = await Promise.all([
      db.problem.getByContest(probid, cid),
      db.language.getById(langid),
    ]);
    if (problems.length === 0){ res.sendStatus(400); return; }
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
      conn.release();
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
      conn.release();
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
    let [clarifications, categories] = await Promise.all([
      db.clarification.getListByCidTeam(cid, teamid),
      db.configuration.getConfig('clar_categories', {'general':'General issue', 'tech':'Technical issue'}),
    ]);
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
    let [clarifications, categories] = await Promise.all([
      db.clarification.getMyListByCidTeam(cid, teamid),
      db.configuration.getConfig('clar_categories', {'general':'General issue', 'tech':'Technical issue'}),
    ]);
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
    let [data, categories] = await Promise.all([
      db.clarification.getNextByIdTeam(respid, teamid),
      db.configuration.getConfig('clar_categories', {'general':'General issue', 'tech':'Technical issue'}),
    ]);
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
    let [affil, total, category, problems] = await Promise.all([
      db.affiliation.getByAffilId(team.affilid),
      db.scoreboard.getTotalByTeam(cid, teamid),
      db.team.getTeamCategoryByTeam(teamid),
      db.problem.getListByContest(cid),
    ]);
    affil = affil[0]; total = total[0] || {points: 0, totaltime: 0}; category = category[0];
    let {sortorder, color} = category;
    rank = (await db.scoreboard.getBetterThan(cid, total.points, total.totaltime, sortorder)) + 1;

    let info = {};
    for (let problem of problems)
      info[problem.probid] = {
        probid: problem.probid,
        shortname: problem.shortname,
        submissions: 0,
        pending: 0,
        solvetime: 0,
        is_correct: 0,
        is_first: false,
      };

    const score_in_seconds = (await db.configuration.getConfig('score_in_seconds', 0));
    let to_score = solvetime => score_in_seconds ? solvetime : Math.floor(solvetime / 60);
    // TODO: hard review
    // tie breaking
    if (total.points > 0){
      let tied = (await db.scoreboard.getTied(cid, total.points, total.totaltime, sortorder)).map(e => e.teamid);
      if (tied.length >= 1){
        let my_times = (await db.scoreboard.getCorrectProblemScoreList(cid, teamid)).map(e => to_score(e.solvetime));
        for (let tid of tied){
          let you = (await db.scoreboard.getCorrectProblemScoreList(cid, tid)).map(e => to_score(e.solvetime));
          for (let i=0;i<you.length;i++){
            if (you[i] < my_times[i]) rank++;
            if (you[i] !== my_times[i]) break;
          }
        }
      }
    }
    let firstsovletimes = (await db.scoreboard.getFirstSolveTime(cid, sortorder)).reduce((acc, cur) => {
      acc[cur.probid] = to_score(cur.solvetime);
      return acc;
    }, {});
    for (let e of (await db.scoreboard.getProblemScoreList(cid, teamid))){
      e.solvetime = to_score(e.solvetime);
      e.is_first = firstsovletimes[e.probid] === e.solvetime && e.is_correct;
      info[e.probid] = e;
    }
    let detail = Object.values(info);
    detail.sort((a, b) => {
      if (a.shortname < b.shortname) return -1;
      if (a.shortname > b.shortname) return 1;
      return 0;
    });
    if (contest.freezetime && contest.freezetime*1000 <= Date.now() && (!contest.unfreezetime || contest.unfreezetime*1000 > Date.now()))
      rank = '?';
    res.send({points: total.points, totaltime: total.totaltime, rank, detail, team: {
      teamid: team.teamid,
      teamname: team.name,
      affilname: (affil && affil.name) || null,
      country: (affil && affil.country) || null,
      color: color,
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
    if (contest.starttime*1000 > now){ res.json(null); return; }
    let final = false;
    if ((!contest.freezetime && contest.endtime*1000 <= now) ||
        (contest.unfreezetime && contest.unfreezetime*1000 <= now))
      final = true;
    let frozen = false;
    if (contest.freezetime && contest.freezetime*1000 <= now && (!contest.unfreezetime || contest.unfreezetime*1000 >= now))
      frozen = true;
    const target = final ? 'restricted' : 'public';
    let [teams, problems, caches, score_in_seconds, penalty1, show_pending, show_affiliations, show_teams_submissions] = await Promise.all([
      db.team.getPublicList(cid),
      db.problem.getListByContest(cid),
      db.scoreboard.getScorecacheList(cid, target),
      db.configuration.getConfig('score_in_seconds', 0),
      db.configuration.getConfig('penalty_time', 20),
      db.configuration.getConfig('show_pending', 0),
      db.configuration.getConfig('show_affiliations', 1),
      db.configuration.getConfig('show_teams_submissions', 1),
    ]);
    let second_to_score = v => score_in_seconds ? v : Math.floor(v / 60);
    let minute_to_score = v => score_in_seconds ? v*60 : v;
    let sortorder_of_team = {};
    let firstsolve = {};
    let table = {};
    for (let team of teams){
      sortorder_of_team[team.teamid] = team.sortorder;
      firstsolve[team.sortorder] = {};
      table[team.teamid] = {points: 0, totaltime: minute_to_score(team.penalty), solve_times: []};
      for (let problem of problems) table[team.teamid][problem.probid] = {
        probid: problem.probid, shortname: problem.shortname,
        submissions: 0, pending: 0, solvetime: 0, is_correct: 0, is_first: false
      };
    }
    // caches must order by totaltime
    for (let cache of caches){
      let row = table[cache.teamid];
      if (!row) continue;
      let cell = row[cache.probid];
      if (!cell) continue;
      cache.solvetime = second_to_score(cache.solvetime);
      const sortorder = sortorder_of_team[cache.teamid];
      if (cache.is_correct && !cell.is_correct){
        if (firstsolve[sortorder][cache.probid] === undefined)
          firstsolve[sortorder][cache.probid] = cache.solvetime;
        row.points++;
        row.totaltime += cache.solvetime + minute_to_score(penalty1) * (cache.submissions - 1);
        row.solve_times.push(cache.totaltime);
        if (cache.totaltime === firstsolve[sortorder][cache.probid])
          cell.is_first = true;
      }
      cell.submissions = cache.submissions;
      cell.pending = show_pending ? cache.pending : 0;
      cell.solvetime = cache.solvetime;
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
      if (!show_affiliations)
        row.team.affilname = row.team.country = null;
      if (!show_teams_submissions)
        row.detail = [];
    }
    if (!show_teams_submissions) problems = [];
    for (let row of ret) delete row.solve_times;
    res.send({scoreboard: ret, problems, final, frozen});
  })(req, res)
    .catch(() => res.sendStatus(500));
});

router.use('/', (req, res) => {
  // 404 Not found for remaining requests
  res.sendStatus(404);
});

module.exports = router;
