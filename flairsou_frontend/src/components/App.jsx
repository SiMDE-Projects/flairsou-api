import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import PageContainer from './containers/PageContainer';

const App = () => (
  <BrowserRouter>
    <PageContainer>
      <>
        <Route
          path="/"
          component={() => (
            <>
              Hello, this is home page
            </>
          )}
        />
      </>
    </PageContainer>
  </BrowserRouter>
);

export default App;
