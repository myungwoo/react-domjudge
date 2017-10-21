const pool = require('./pool');

exports.getListByContest = cid => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT p.probid, cp.shortname, p.name
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

exports.getByContest = (probid, cid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT probid, name
        FROM problem
        JOIN contestproblem USING (probid)
        WHERE allow_submit = 1 AND probid = ? AND cid = ?`, [probid, cid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};
