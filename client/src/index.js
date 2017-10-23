import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import {I18nextProvider} from 'react-i18next';
import {HashRouter} from 'react-router-dom';
import App from './App';
import i18n from './i18n';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <I18nextProvider i18n={i18n()}>
    <HashRouter>
      <App />
    </HashRouter>
  </I18nextProvider>, document.getElementById('root'));
registerServiceWorker();
