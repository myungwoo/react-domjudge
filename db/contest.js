const pool = require('./pool');

exports.getPublicList = () => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM contest
                WHERE enabled = 1 AND public = 1 AND activatetime <= UNIX_TIMESTAMP() AND
                (deactivatetime IS NULL OR deactivatetime > UNIX_TIMESTAMP())
                ORDER BY activatetime`, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getListByTeam = teamid => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM contest
                LEFT JOIN contestteam USING (cid)
                WHERE (contestteam.teamid = ? OR contest.public = 1) AND
                enabled = 1 AND activatetime <= UNIX_TIMESTAMP() AND
                (deactivatetime IS NULL OR deactivatetime > UNIX_TIMESTAMP())
                ORDER BY activatetime`, [teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getContestByCid = cid => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM contest WHERE cid = ?', [cid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};

exports.getContestByCidTeam = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT *
        FROM      contest     as c
        LEFT JOIN contestteam as ct ON (c.cid = ct.cid AND ct.teamid = ?)
        WHERE c.cid = ? AND (ct.teamid = ? OR c.public = 1)`, [teamid, cid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};
