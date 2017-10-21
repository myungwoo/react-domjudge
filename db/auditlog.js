const pool = require('./pool');

exports.addLog = (cid, user, datatype, dataid, action, extrainfo) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO auditlog (logtime, cid, user, datatype, dataid, action, extrainfo) VALUES(NOW(), ?, ?, ?, ?, ?, ?)',
      [cid, user, datatype, dataid, action, extrainfo], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};
