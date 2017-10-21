const pool = require('./pool');

exports.getList = () => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT name, value, description FROM configuration', (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};
