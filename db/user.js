const pool = require('./pool');

exports.getByUsername = username => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM user WHERE username = ?', [username], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};

exports.login = (username, ip_address) => {
  return new Promise((resolve, reject) => {
    pool.query('UPDATE user SET last_login = UNIX_TIMESTAMP(), last_ip_address = ? WHERE username = ?', [ip_address, username], (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};
