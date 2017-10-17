const pool = require('./pool');

exports.getByAffilId = affilid => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM team_affiliation WHERE affilid = ?', [affilid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};
