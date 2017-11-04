import axios from 'axios';

import Contest from './contest';

import {localStoragePrefix as pfx} from '../config';

const Auth = {
  doLogin: async function(username, password) {
    let res = await axios.post('./api/auth/login', {
      username: username,
      password: password
    });
    if (res.data.success){
      localStorage.setItem(pfx + 'jwt-token', res.data.token);
      localStorage.setItem(pfx + 'userdata', JSON.stringify(res.data.userdata));
      await Contest.updateInfo();
      return null;
    }else{
      return res.data.error;
    }
  },

  doLogout: () => {
    localStorage.removeItem(pfx + 'jwt-token');
    localStorage.removeItem(pfx + 'userdata');
  },

  validateUser: async function() {
    let res = await axios.get('./api/auth/user', Auth.getHeader());
    if (res.data){
      localStorage.setItem(pfx + 'userdata', JSON.stringify(res.data));
    }else{
      localStorage.removeItem(pfx + 'jwt-token');
      localStorage.removeItem(pfx + 'userdata');
    }
    return res.data;
  },

  getUser: () => {
    try{
      if (localStorage.getItem(pfx + 'jwt-token'))
        return JSON.parse(localStorage.getItem(pfx + 'userdata') || null);
      return null;
    }catch(err){
      localStorage.removeItem(pfx + 'jwt-token');
      localStorage.removeItem(pfx + 'userdata');
      return null;
    }
  },

  getHeader: () => ({headers: {'authorization': `Bearer ${localStorage.getItem(pfx + 'jwt-token')}`}})
};

export default Auth;
