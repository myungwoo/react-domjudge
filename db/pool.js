const mysql = require('mysql');
const config = require('../config');

let pool = mysql.createPool({
  connectionLimit : config.db.connection_limit,
  host            : config.db.host,
  user            : config.db.user,
  password        : config.db.password,
  database        : config.db.database,
  port            : config.db.port
});

module.exports = pool;
