import axios from 'axios';

import Contest from './contest';

const Auth = {
  doLogin: async function(username, password) {
    let res = await axios.post('/api/auth/login', {
      username: username,
      password: password
    });
    if (res.data.success){
      localStorage.setItem('jwt-token', res.data.token);
      localStorage.setItem('userdata', JSON.stringify(res.data.userdata));
      await Contest.updateInfo();
      return null;
    }else{
      return res.data.error;
    }
  },

  doLogout: () => {
    localStorage.removeItem('jwt-token');
    localStorage.removeItem('userdata');
  },

  validateUser: async function() {
    let res = await axios.get('/api/auth/user', Auth.getHeader());
    if (res.data){
      localStorage.setItem('userdata', JSON.stringify(res.data));
    }else{
      localStorage.removeItem('jwt-token');
      localStorage.removeItem('userdata');
    }
    return res.data;
  },

  getUser: () => {
    try{
      if (localStorage.getItem('jwt-token'))
        return JSON.parse(localStorage.getItem('userdata') || null);
      return null;
    }catch(err){
      localStorage.removeItem('jwt-token');
      localStorage.removeItem('userdata');
      return null;
    }
  },

  getHeader: () => ({headers: {'x-access-token': localStorage.getItem('jwt-token')}})
};

export default Auth;