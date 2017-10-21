const pool = require('./pool');

exports.getListByTeamContest = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT s.submitid, s.teamid, s.probid, s.langid, s.submittime, cp.shortname, p.name, j.result, j.seen, s.valid, j.verified
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

exports.getDetailByTeam = (submitid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT p.probid, cp.shortname, p.name AS probname, submittime, s.valid, l.name AS langname, result, output_compile, verified, judgingid, s.cid
        FROM judging             as j
        LEFT JOIN submission     as s  USING (submitid)
        LEFT JOIN language       as l  USING (langid)
        LEFT JOIN problem        as p     ON (p.probid = s.probid)
        LEFT JOIN contestproblem as cp    ON (cp.probid = p.probid AND cp.cid = s.cid)
        WHERE j.submitid = ? AND teamid = ? AND j.valid = 1`, [submitid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};
