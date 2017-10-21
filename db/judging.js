const pool = require('./pool');

exports.setSeen = judgingid => {
  return new Promise((resolve, reject) => {
    pool.query('UPDATE judging SET seen = 1 WHERE judgingid = ?', [judgingid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};
