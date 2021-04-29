import React from 'react';
import { render } from 'react-dom';

import App from './components/App';

const container = document.getElementById('app');
render(React.createElement(App), container);
