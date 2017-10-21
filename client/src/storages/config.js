import axios from 'axios';

const Config = {
  updateInfo: async function() {
    let res = await axios.get('/api/config');
    let configs = res.data;
    localStorage.setItem('configs', JSON.stringify(configs));
  },
  getConfig: () => JSON.parse(localStorage.getItem('configs') || '[]'),
};

export default Config;
