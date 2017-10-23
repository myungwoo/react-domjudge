import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';

const options = {
  debug: false,
  fallbackLng: 'en',
  backend: {
    loadPath: './locales/{{lng}}.json',
    allowMultiLoading: false
  },
};

export default () => {
  i18n
    .use(XHR)
    .init(options);
  return i18n;
};
