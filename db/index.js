const pool = require('./pool');

module.exports = {
  pool: pool,
  ping: () => (
    new Promise((resolve, reject) => {
      pool.query('SELECT 1', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    })
  ),
  user: require('./user'),
  team: require('./team'),
  affiliation: require('./affiliation'),
  contest: require('./contest'),
  submission: require('./submission'),
};
