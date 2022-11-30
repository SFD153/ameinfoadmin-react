import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { Helmet } from 'react-helmet';
import 'es6-promise/auto';
import 'setimmediate';
import ability from './configs/ability';

import { LocaleProvider } from 'antd';
import registerServiceWorker from 'registerServiceWorker';
import { history, store } from 'stores';

import Layout from 'components/LayoutComponents/Layout';

import 'resources/_antd.less'; // redefinition AntDesign variables
import 'bootstrap/dist/css/bootstrap.min.css'; // bootstrap styles

import 'resources/AntStyles/AntDesign/antd.cleanui.scss';
import 'resources/CleanStyles/Core/core.cleanui.scss';
import 'resources/CleanStyles/Vendors/vendors.cleanui.scss';

// Require Froala Editor files.
import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-word-counter-plugin/word_counter.js';

window.ability = ability;

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <LocaleProvider>
        <div>
          <Helmet titleTemplate="AMEinfo - %s" />
          <Layout />
        </div>
      </LocaleProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
registerServiceWorker();

export default history;
