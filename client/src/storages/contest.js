import axios from 'axios';

import Auth from './auth';

const Contest = {
  getList: async function() {
    let res = await axios.get('/api/contests', Auth.getHeader());
    let contests = res.data;
    localStorage.setItem('contests', JSON.stringify(contests));
    let current_contest = JSON.parse(localStorage.getItem('contest') || null);
    if (!contests.includes(current_contest))
      localStorage.setItem('contest', JSON.stringify(contests[0] || null));
    return contests;
  },
  getContest: () => JSON.parse(localStorage.getItem('contest') || null)
};

export default Contest;
