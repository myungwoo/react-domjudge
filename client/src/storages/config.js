import axios from 'axios';

const Config = {
  updateInfo: async function() {
    let res = await axios.get('/api/config');
    let configs = res.data;
    localStorage.setItem('configs', JSON.stringify(configs));
  },
  getConfig: (key, defaultValue) => {
    let configs = JSON.parse(localStorage.getItem('configs') || '{}');
    return configs.key || defaultValue;
  }
};

export default Config;
