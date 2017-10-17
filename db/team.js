const pool = require('./pool');

exports.getByTeamId = teamid => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM team WHERE teamid = ?', [teamid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};

exports.teampage_visit = teamid => {
  return new Promise((resolve, reject) => {
    pool.query('UPDATE team SET teampage_first_visited = UNIX_TIMESTAMP() WHERE teamid = ? AND teampage_first_visited IS NULL', [teamid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};
