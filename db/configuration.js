const pool = require('./pool');

exports.getList = () => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT name, value, description FROM configuration', (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};

exports.getConfig = (key, defaultValue) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT name, value, description FROM configuration WHERE name = ?', [key], (err, res) => {
      if (err) reject(err);
      if (res.length === 0) resolve(defaultValue);
      res = res[0]; res.value = JSON.parse(res.value);
      resolve(res.value);
    });
  });
};

