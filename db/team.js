const pool = require('./pool');

exports.getByTeamId = teamid => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM team WHERE teamid = ?', [teamid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};

exports.getTeamCategoryByTeam = teamid => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM team_category LEFT JOIN team USING (categoryid) WHERE teamid = ?', [teamid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};

exports.teampageVisit = teamid => {
  return new Promise((resolve, reject) => {
    pool.query('UPDATE team SET teampage_first_visited = UNIX_TIMESTAMP() WHERE teamid = ? AND teampage_first_visited IS NULL', [teamid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};

exports.getPublicList = cid => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT t.teamid, t.name AS teamname, ta.name AS affilname, ta.country, tc.sortorder, t.penalty, tc.name AS category, tc.color
                FROM team t
                LEFT JOIN team_affiliation ta USING (affilid)
                LEFT JOIN contest c ON (c.cid = ?)
                LEFT JOIN contestteam ct ON (c.cid = ct.cid AND ct.teamid = t.teamid)
                LEFT JOIN team_category tc USING (categoryid)
                WHERE (c.public = 1 OR ct.teamid IS NOT NULL) AND tc.visible = 1`,
      [cid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};
