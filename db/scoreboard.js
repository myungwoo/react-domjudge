const pool = require('./pool');

exports.getTotalByTeam = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT points, totaltime FROM rankcache_jury WHERE cid = ? AND teamid = ?',
      [cid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getBetterThan = (cid, points, totaltime, sortorder) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT COUNT(t.teamid)
                FROM rankcache_jury AS rc
                LEFT JOIN team as t ON (t.teamid = rc.teamid)
                LEFT JOIN team_category as tc ON (tc.categoryid = t.categoryid)
                WHERE rc.cid = ? AND tc.sortorder = ? AND t.enabled = 1
                AND (rc.points > ? OR (rc.points = ? AND rc.totaltime < ?))`,
      [cid, sortorder, points, points, totaltime], (err, res) => {
        if (err || !res[0]) reject(err);
        resolve(res[0]['COUNT(t.teamid)']);
      });
  });
};

exports.getTied = (cid, points, totaltime, sortorder) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT t.teamid
                FROM rankcache_jury AS rc
                LEFT JOIN team as t ON (t.teamid = rc.teamid)
                LEFT JOIN team_category as tc ON (tc.categoryid = t.categoryid)
                WHERE rc.cid = ? AND tc.sortorder = ? AND t.enabled = 1
                AND rc.points = ? AND rc.totaltime = ?`,
      [cid, sortorder, points, totaltime], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getCorrectProblemScoreList = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT *
                FROM scorecache_jury AS sc
                LEFT JOIN contestproblem cp USING (probid, cid)
                WHERE sc.cid = ? AND is_correct = 1 AND allow_submit = 1 AND teamid = ?
                ORDER BY totaltime DESC`,
      [cid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getProblemScoreList = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT sc.probid, p.shortname, sc.submissions, sc.pending, sc.totaltime, sc.is_correct
                FROM scorecache_jury sc
                LEFT JOIN contestproblem p USING (probid, cid)
                WHERE cid = ? AND teamid = ?
                ORDER BY p.shortname`,
      [cid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getFirstSolveTime = (cid, sortorder) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT probid, MIN(totaltime)
                FROM scorecache_jury
                LEFT JOIN team USING (teamid)
                LEFT JOIN team_category USING (categoryid)
                WHERE is_correct = 1 AND cid = ? AND sortorder = ? GROUP BY probid`,
      [cid, sortorder], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getScorecacheList = (cid, target) => {
  target = target || 'public';
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM scorecache_${target} WHERE cid = ? ORDER BY totaltime`, [cid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};
