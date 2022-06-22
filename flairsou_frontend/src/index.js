import React from 'react';
import { render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import { Provider } from 'react-redux';
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import App from './components/App';
import store from './store';

import './index.css';

Sentry.init({
  dsn: 'https://8187426c2af7419d95a640b957cbeb9d@o1296214.ingest.sentry.io/6522978',
  integrations: [new BrowserTracing()],
  environment: 'developpement',
  tracesSampleRate: 1.0,
});

const container = document.getElementById('app');

render(React.createElement(Provider, { store }, React.createElement(App)), container);
