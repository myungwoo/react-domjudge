const Language = {
  getLanguage: () => localStorage.getItem('language') || 'en',
  setLanguage: lng => {
    localStorage.setItem('language', lng);
  }
};

export default Language;
