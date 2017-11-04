import {localStoragePrefix as pfx} from '../config';

const Language = {
  getLanguage: () => localStorage.getItem(pfx + 'language') || 'en',
  setLanguage: lng => {
    localStorage.setItem(pfx + 'language', lng);
  }
};

export default Language;
