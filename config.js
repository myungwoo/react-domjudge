module.exports = {
  auth: {
    secret      : 'DDQwP6fY4TZBDsWhgWWLUNhKWp9V7TsXEbw77yVe4QupSmJR', // You *must* change secret key every different use
    token_expire: '10h',
    issuer      : 'Myungwoo Chun',
    subject     : 'token-v1',
  },
  db: {
    connection_limit: 500,
    host            : 'localhost',
    user            : 'domjudge',
    password        : 'password',
    database        : 'domjudge',
    port            : 3306,
  },
  express: {
    max_body_size: '10mb',
  },
  domjudge: {
    allow_view_submitted_files: true
  }
};
