const pool = require('./pool');

exports.getList = () => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT langid, name, extensions FROM language WHERE allow_submit = 1', (err, res) => {
      if (err) reject(err);
      resolve(res.map(e => {
        e.extensions = JSON.parse(e.extensions);
        return e;
      }));
    });
  });
};

exports.getById = langid => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT langid FROM language WHERE langid = ? AND allow_submit = 1', [langid], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};
