import React from 'react';
import { render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css';

import App from './components/App';

const container = document.getElementById('app');
render(React.createElement(App), container);
