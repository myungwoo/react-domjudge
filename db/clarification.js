const pool = require('./pool');

exports.getListByCidTeam = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT c.clarid, c.cid, c.submittime, c.category, c.body, cp.shortname, t.name AS 'to', f.name AS 'from', u.mesgid AS unread
                FROM clarification c
                LEFT JOIN problem p USING (probid)
                LEFT JOIN contestproblem cp USING (probid, cid)
                LEFT JOIN team t ON (t.teamid = c.recipient)
                LEFT JOIN team f ON (f.teamid = c.sender)
                LEFT JOIN team_unread u ON (c.clarid=u.mesgid AND u.teamid = ?)
                WHERE c.cid = ? AND c.sender IS NULL AND (c.recipient IS NULL OR c.recipient = ?)
                ORDER BY c.submittime DESC, c.clarid DESC`,
      [teamid, cid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getByIdTeam = (clarid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT c.*, cp.shortname, p.name AS probname, t.name AS 'to', f.name AS 'from'
                FROM clarification c
                LEFT JOIN problem p USING (probid)
                LEFT JOIN team t ON (t.teamid = c.recipient)
                LEFT JOIN team f ON (f.teamid = c.sender)
                LEFT JOIN contest co ON (co.cid = c.cid)
                LEFT JOIN contestproblem cp ON (cp.probid = c.probid AND cp.cid = c.cid AND cp.allow_submit = 1)
                WHERE c.clarid = ? AND (c.recipient IS NULL OR c.recipient = ?) AND (c.sender IS NULL OR c.sender = ?)
                ORDER BY c.submittime, c.clarid`,
      [clarid, teamid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getNextByIdTeam = (clarid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT c.*, cp.shortname, p.name AS probname, t.name AS 'to', f.name AS 'from'
                FROM clarification c
                LEFT JOIN problem p USING (probid)
                LEFT JOIN team t ON (t.teamid = c.recipient)
                LEFT JOIN team f ON (f.teamid = c.sender)
                LEFT JOIN contest co ON (co.cid = c.cid)
                LEFT JOIN contestproblem cp ON (cp.probid = c.probid AND cp.cid = c.cid AND cp.allow_submit = 1)
                WHERE (c.respid = ? OR c.clarid = ?) AND (c.recipient IS NULL OR c.recipient = ?) AND (c.sender IS NULL OR c.sender = ?)
                ORDER BY c.submittime, c.clarid`,
      [clarid, clarid, teamid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.addByCategory = (cid, teamid, category, body) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO clarification
                (cid, respid, submittime, sender, recipient, jury_member, probid, category, body, answered) VALUES
                (?, null, UNIX_TIMESTAMP(), ?, null, null, null, ?, ?, 0)`,
      [cid, teamid, category, body], (err, res) => {
        if (err) reject(err);
        resolve(res.insertId);
      });
  });
};

exports.addByProblem = (cid, teamid, probid, body) => {
  return new Promise((resolve, reject) => {
    pool.query(`INSERT INTO clarification
                (cid, respid, submittime, sender, recipient, jury_member, probid, category, body, answered) VALUES
                (?, null, UNIX_TIMESTAMP(), ?, null, null, ?, null, ?, 0)`,
      [cid, teamid, probid, body], (err, res) => {
        if (err) reject(err);
        resolve(res.insertId);
      });
  });
};

exports.setRead = (clarid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query('DELETE FROM team_unread WHERE mesgid = ? AND teamid = ?', [clarid, teamid], (err, res) => {
      if (err) reject(err);
      resolve(res.insertId);
    });
  });
};
