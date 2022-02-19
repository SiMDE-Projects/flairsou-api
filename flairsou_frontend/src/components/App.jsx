/* eslint-disable react/jsx-props-no-spreading */

/* Le spreading est utilisé pour la création des routes custom (PrivateRoute)
 Il est plus clair et plus concis que si l'on devait lister tous les props de Route dans
 PrivateRoute et les passer un par un.
*/

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter, Redirect, Route, Switch,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import { AppContext } from './contexts/contexts';

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

// routes de l'API
const authlinkUrl = '/oauth/authlink';
const userInfosUrl = '/proxy_pda/get_user_infos';
const assosUrl = '/proxy_pda/get_list_assos';

const App = () => {
  // informations sur l'utilisateur
  const [user, setUser] = useState({ id: null, firstname: null, lastname: null });

  // liste des assos de l'utilisateur
  const [assos, setAssos] = useState([]);

  // association active dans l'application
  const [assoActive, setAssoActive] = useState('');

  // récupération des informations de l'utilisateur
  useEffect(() => {
    fetch(userInfosUrl)
      .then((response) => {
        if (response.status === 403) {
          // l'utilisateur n'est pas connecté, on le renvoie vers la page de connexion
          fetch(authlinkUrl)
            .then((newResponse) => newResponse.json())
            .then((newResponse) => {
              window.location.href = newResponse.link;
            });
        }
        if (response.status === 200) {
          response.json().then((validResponse) => {
            // mise à jour des informations utilisateur
            setUser(validResponse);
          });
        }
      });
  }, []);

  // récupération de la liste des associations
  useEffect(() => {
    // on ignore si l'utilisateur n'a pas été récupéré
    if (!user.id) return;

    fetch(assosUrl)
      .then((response) => {
        if (response.status === 200) {
          response.json().then((newResponse) => {
            setAssos(newResponse);
          });
        }
      });
  }, [user]);

  return (
    <React.StrictMode>
      <AppContext.Provider value={{
        user, assos, assoActive, updateAssoActive: (assoId) => { setAssoActive(assoId); },
      }}
      >
        <BrowserRouter>
          <Switch>
            <Route path="/" exact component={Home} />
          </Switch>
        </BrowserRouter>
      </AppContext.Provider>
    </React.StrictMode>
  );
};

export default App;
