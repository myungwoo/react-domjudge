const pool = require('./pool');

exports.getListByTeamContest = (cid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT s.submitid, s.teamid, s.probid, s.langid, s.submittime, cp.shortname, p.name, j.result, j.seen, s.valid, j.verified
        FROM submission          as s
        JOIN contestproblem      as cp USING (probid, cid)
        JOIN problem             as p  USING (probid)
        LEFT JOIN judging        as j     ON (s.submitid = j.submitid AND j.valid = 1)
        WHERE s.cid = ? AND s.teamid = ?
        ORDER BY s.submittime DESC, s.submitid DESC`, [cid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
  });
};

exports.getDetailByTeam = (submitid, teamid) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT p.probid, cp.shortname, p.name AS probname, submittime, s.valid, l.name AS langname, result, output_compile, verified, judgingid, s.cid
        FROM judging        as j
        JOIN submission     as s  USING (submitid)
        JOIN language       as l  USING (langid)
        JOIN problem        as p     ON (p.probid = s.probid)
        JOIN contestproblem as cp    ON (cp.probid = p.probid AND cp.cid = s.cid)
        WHERE j.submitid = ? AND teamid = ? AND j.valid = 1`, [submitid, teamid], (err, res) => {
        if (err) reject(err);
        resolve(res.map(e => {
          if (e.output_compile) e.output_compile = e.output_compile.toString('utf-8');
          return e;
        }));
      });
  });
};

exports.getSampleRun = submitid => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT r.runresult, r.runtime, r.output_run, r.output_diff, r.output_error, t.rank, t.description
        FROM judging     as j
        JOIN submission  as s USING (submitid)
        JOIN testcase    as t    ON (t.probid = s.probid AND t.sample = 1)
        JOIN judging_run as r    ON (r.testcaseid = t.testcaseid AND r.judgingid = j.judgingid)
        WHERE submitid = ? ORDER BY t.rank`, [submitid], (err, res) => {
        if (err) reject(err);
        resolve(res.map(e => {
          if (e.output_run) e.output_run = e.output_run.toString('utf-8');
          if (e.output_diff) e.output_diff = e.output_diff.toString('utf-8');
          if (e.output_error) e.output_error = e.output_error.toString('utf-8');
          return e;
        }));
      });
  });
};

exports.getSubmissionFiles = submitid => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT filename, rank, sourcecode FROM submission_file WHERE submitid = ?', [submitid], (err, res) => {
      if (err) reject(err);
      resolve(res.map(e => {
        if (e.sourcecode) e.sourcecode = e.sourcecode.toString('utf-8');
        return e;
      }));
    });
  });
};

exports.addSubmission = (cid, teamid, probid, langid, connection) => {
  const conn = connection || pool;
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO submission (cid, teamid, probid, langid, submittime)
        VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())`, [cid, teamid, probid, langid], (err, res) => {
        if (err) reject(err);
        resolve(res.insertId);
      });
  });
};

exports.addSubmissionFile = (submitid, filename, rank, sourcecode, connection) => {
  const conn = connection || pool;
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO submission_file (submitid, filename, rank, sourcecode)
        VALUES (?, ?, ?, ?)`, [submitid, filename, rank, sourcecode], (err, res) => {
        if (err) reject(err);
        resolve(res.insertId);
      });
  });
};
