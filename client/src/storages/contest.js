import axios from 'axios';

import Auth from './auth';

import {localStoragePrefix as pfx} from '../config';

const Contest = {
  updateInfo: async function() {
    let res = await axios.get('./api/contests', Auth.getHeader());
    let contests = res.data;
    localStorage.setItem(pfx + 'contests', JSON.stringify(contests));
    let current_contest = JSON.parse(localStorage.getItem(pfx + 'contest') || null);
    localStorage.setItem(pfx + 'contest', JSON.stringify(contests[0] || null));
    if (current_contest){
      let idx = contests.map(e => e.cid).indexOf(current_contest.cid);
      if (idx >= 0)
        localStorage.setItem(pfx + 'contest', JSON.stringify(contests[idx] || null));
    }
    return contests;
  },
  getList: () => JSON.parse(localStorage.getItem(pfx + 'contests') || '[]'),
  getContest: () => JSON.parse(localStorage.getItem(pfx + 'contest') || null),
  setContest: (contest) => {
    let contests = JSON.parse(localStorage.getItem(pfx + 'contests') || '[]');
    if (!contests.map(e => e.cid).includes(contest.cid))
      return false;
    localStorage.setItem(pfx + 'contest', JSON.stringify(contest || null));
    return true;
  }
};

export default Contest;
