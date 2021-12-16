/* eslint-disable react/jsx-props-no-spreading */

/* Le spreading est utilisé pour la création des routes custom (PrivateRoute)
 Il est plus clair et plus concis que si l'on devait lister tous les props de Route dans
 PrivateRoute et les passer un par un.
*/

import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Home from './pages/home/Home';

const PrivateRoute = ({ component: Component, userIdentified, ...rest }) => (
  <Route
    {...rest}
    render={(props) => (
      userIdentified === true
        ? <Component {...props} />
        : (
          <Redirect to={{
            pathname: '/login',
            state: { from: props.location },
          }}
          />
        )
    )}
  />
);

PrivateRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  userIdentified: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }),
};

PrivateRoute.defaultProps = {
  location: null,
};

const App = ({ userIdentified }) => (
    <React.StrictMode>
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={ Home } />
            </Switch>
        </BrowserRouter>
    </React.StrictMode>
);

App.propTypes = {
  userIdentified: PropTypes.bool.isRequired,
};

export default connect((store) => ({
  userIdentified: store.user.identified,
}))(App);

