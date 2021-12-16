import React from 'react';
import { render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import { Provider } from 'react-redux';

import App from './components/App';
import store from './store';

import './index.css';

const container = document.getElementById('app');

render(React.createElement(Provider, { store }, React.createElement(App)), container);
