import axios from 'axios';

const Auth = {
  doLogin: async function(username, password) {
    try{
      let res = await axios.post('/api/auth/login', {
        username: username,
        password: password
      });
      if (res.data.success){
        localStorage.setItem('jwt-token', res.data.token);
        localStorage.setItem('userdata', JSON.stringify(res.data.userdata));
        return null;
      }else{
        return res.data.error;
      }
    } catch (err) {
      return 'connection';
    }
  },

  doLogout: () => {
    localStorage.removeItem('jwt-token');
    localStorage.removeItem('userdata');
  },

  isLoggedIn: () => {
    // TODO: always check with axios
    // axios.get
  },

  getUser: () => JSON.parse(localStorage.getItem('userdata') || 'null'),

  getHeader: () => {
    return {headers: {'x-access-token': localStorage.getItem('jwt-token')}};
  }
};

export default Auth;
