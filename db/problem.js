const pool = require('./pool');

exports.getListByContest = cid => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT p.probid, cp.shortname, p.name, cp.color
        FROM problem        as p
        JOIN contestproblem as cp USING (probid)
        JOIN contest        as c  USING (cid)
        WHERE c.cid = ? AND cp.allow_submit = 1 AND c.starttime <= UNIX_TIMESTAMP()
        ORDER BY cp.shortname`, [cid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getListByContestWithText = cid => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT p.probid, cp.shortname, p.name, cp.color
        FROM problem        as p
        JOIN contestproblem as cp USING (probid)
        JOIN contest        as c  USING (cid)
        WHERE c.cid = ? AND cp.allow_submit = 1 AND c.starttime <= UNIX_TIMESTAMP() AND problemtext IS NOT NULL
        ORDER BY cp.shortname`, [cid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getByContest = (probid, cid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT probid, p.name, problemtext, cp.color
        FROM problem as p
        JOIN contestproblem USING (probid)
        JOIN contest        USING (cid)
        WHERE allow_submit = 1 AND probid = ? AND cid = ? AND starttime <= UNIX_TIMESTAMP()`, [probid, cid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};
