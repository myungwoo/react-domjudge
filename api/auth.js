const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const crypto = require('crypto');
const TwinBcrypt = require('twin-bcrypt');

// It chould be changed by DOMjudge's hashing algorithm
const hash_password = (username, password) => crypto.createHash('md5').update(username + '#' + password).digest('hex');

router.post('/login', (req, res) => {
  (async function(req, res) {
    const secret = req.app.get('jwt-secret');
    const data = req.body;
    try{
      let user = (await db.user.getByUsername(data.username))[0];
      if (!user) throw new Error('no_user');
      if (user.password !== hash_password(user.username, data.password) &&
          !TwinBcrypt.compareSync(data.password, user.password)) throw new Error('wrong_password');

      let team = (await db.team.getByTeamId(user.teamid))[0];
      if (!team) throw new Error('no_team');

      let contests = await db.contest.getListByTeam(team.teamid);
      if (contests.length === 0) throw new Error('no_contest');

      let affiliation = (await db.affiliation.getByAffilId(team.affilid))[0] || null;
      let userdata = {
        userid: user.userid,
        username: user.username,
        name: user.name,
        teamname: team.name,
        teamid: team.teamid,
        affiliation: affiliation
      };
      const token = jwt.sign(userdata, secret, {
        expiresIn: req.app.get('jwt-expire'),
        issuer: req.app.get('jwt-issuer'),
        subject: req.app.get('jwt-subject'),
      });

      let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      db.user.login(user.username, ip);
      db.team.teampageVisit(team.teamid);
      res.send({
        success: true,
        userdata,
        token
      });
      try{
        db.auditlog.addLog(null, user.username, 'user', user.userid, 'logged in', `${ip} - via react`);
      }catch (err){
        // ignore
      }
    } catch (error) {
      res.send({
        success: false,
        error: error.message
      });
    }
  })(req, res);
});

router.get('/logout', (req, res) => {
  if (!req.user){ res.sendStatus(401); return; }
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  db.auditlog.addLog(null, req.user.username, 'user', req.user.userid, 'logged out', `${ip} - via react`)
    .catch(() => {});
  res.sendStatus(200);
});

router.get('/user', (req, res) => {
  (async function(req, res){
    if (!req.user) throw Error();
    let user = (await db.user.getByUsername(req.user.username))[0];
    if (!user) throw Error();
    let team = (await db.team.getByTeamId(user.teamid))[0];
    if (!team) throw Error();
    let affiliation = (await db.affiliation.getByAffilId(team.affilid))[0] || null;

    let userdata = {
      userid: user.userid,
      username: user.username,
      name: user.name,
      teamname: team.name,
      teamid: team.teamid,
      affiliation: affiliation
    };
    // If userdata has been updated
    if (JSON.stringify(userdata) !== JSON.stringify(req.user))
      throw Error(); // reject the token
      
    res.send(req.user);
  })(req, res)
    .catch(() => res.json(null));
});

module.exports = router;
