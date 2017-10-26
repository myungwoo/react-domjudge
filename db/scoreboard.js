const pool = require('./pool');

exports.getTotalByTeam = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT points_restricted AS points, totaltime_restricted AS totaltime FROM rankcache WHERE cid = ? AND teamid = ?',
      [cid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getBetterThan = (cid, points, totaltime, sortorder) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT COUNT(t.teamid)
                FROM rankcache AS rc
                LEFT JOIN team as t ON (t.teamid = rc.teamid)
                LEFT JOIN team_category as tc ON (tc.categoryid = t.categoryid)
                WHERE rc.cid = ? AND tc.sortorder = ? AND t.enabled = 1
                AND (rc.points_restricted > ? OR (rc.points_restricted = ? AND rc.totaltime_restricted < ?))`,
      [cid, sortorder, points, points, totaltime], (err, res) => {
        if (err || !res[0]) reject(err);
        resolve(res[0]['COUNT(t.teamid)']);
      });
  });
};

exports.getTied = (cid, points, totaltime, sortorder) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT t.teamid
                FROM rankcache AS rc
                LEFT JOIN team as t ON (t.teamid = rc.teamid)
                LEFT JOIN team_category as tc ON (tc.categoryid = t.categoryid)
                WHERE rc.cid = ? AND tc.sortorder = ? AND t.enabled = 1
                AND rc.points_restricted = ? AND rc.totaltime_restricted = ?`,
      [cid, sortorder, points, totaltime], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getCorrectProblemScoreList = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT solvetime_restricted AS solvetime
                FROM scorecache AS sc
                LEFT JOIN contestproblem cp USING (probid, cid)
                WHERE sc.cid = ? AND is_correct_restricted = 1 AND allow_submit = 1 AND teamid = ?
                ORDER BY solvetime_restricted DESC`,
      [cid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getProblemScoreList = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT sc.probid, p.shortname, sc.submissions_restricted AS submissions, sc.pending_restricted AS pending, sc.solvetime_restricted AS solvetime, sc.is_correct_restricted AS is_correct
                FROM scorecache sc
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
    pool.query(`SELECT probid, MIN(solvetime_restricted) AS solvetime
                FROM scorecache
                LEFT JOIN team USING (teamid)
                LEFT JOIN team_category USING (categoryid)
                WHERE is_correct_restricted = 1 AND cid = ? AND sortorder = ? GROUP BY probid`,
      [cid, sortorder], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getScorecacheList = (cid, t) => {
  t = t || 'public';
  return new Promise((resolve, reject) => {
    pool.query(`SELECT teamid, probid, submissions_${t} AS submissions, pending_${t} AS pending, solvetime_${t} AS solvetime, is_correct_${t} AS is_correct FROM scorecache WHERE cid = ? ORDER BY solvetime`, [cid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};
