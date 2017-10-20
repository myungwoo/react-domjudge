const pool = require('./pool');

exports.getListByTeamContest = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT s.submitid, s.teamid, s.probid, s.langid, s.submittime, cp.shortname, p.name, j.result, j.seen
        FROM submission          as s
        LEFT JOIN contestproblem as cp USING (probid, cid)
        LEFT JOIN problem        as p  USING (probid)
        LEFT JOIN judging        as j     ON (s.submitid = j.submitid AND j.valid = 1)
        WHERE s.cid = ? AND s.teamid = ?
        ORDER BY s.submittime DESC, s.submitid DESC`, [cid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};
