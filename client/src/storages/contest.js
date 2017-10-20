import axios from 'axios';

import Auth from './auth';

const Contest = {
  updateInfo: async function() {
    let res = await axios.get('/api/contests', Auth.getHeader());
    let contests = res.data;
    localStorage.setItem('contests', JSON.stringify(contests));
    let current_contest = JSON.parse(localStorage.getItem('contest') || null);
    if (!contests.map(e => e.cid).includes(current_contest.cid))
      localStorage.setItem('contest', JSON.stringify(contests[0] || null));
    return contests;
  },
  getList: () => JSON.parse(localStorage.getItem('contests') || '[]'),
  getContest: () => JSON.parse(localStorage.getItem('contest') || null),
  setContest: (contest) => {
    let contests = JSON.parse(localStorage.getItem('contests') || '[]');
    if (!contests.map(e => e.cid).includes(contest.cid))
      return false;
    localStorage.setItem('contest', JSON.stringify(contest || null));
    return true;
  }
};

export default Contest;
