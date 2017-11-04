import {localStoragePrefix as pfx, availableLanguages} from '../config';

const defaultLanguage = (availableLanguages && availableLanguages[0] && availableLanguages[0].code) || 'en';
const languageList = (availableLanguages && availableLanguages.map(e => e.code)) || ['en'];

const Language = {
  getLanguage: () => {
    let lng = localStorage.getItem(pfx + 'language');
    if (!lng || !languageList.includes(lng))
      return defaultLanguage;
    return lng;
  },
  setLanguage: lng => {
    localStorage.setItem(pfx + 'language', lng);
  }
};

export default Language;
