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

  // liste des comptes liés à l'association active dans l'application
  const [accountList, setAccountList] = useState([]);

  // fonction permettant de récupérer la clé primaire de chaque livre associé à chaque
  // association de la liste fournie, puis de mettre à jour l'état de la liste des
  // assos
  async function fetchBookPks(assosList) {
    // récupération des livres associés aux entités
    const responses = await Promise.all(
      assosList.map((asso) => fetch(`/api/books/byEntity/${asso.asso_id}/`)),
    );

    // récupérer les retours des appels
    const results = Promise.all(
      responses.map(async (response) => {
        if (response.status !== 200) return { entity: '-1' };

        return response.json();
      }),
    );

    // associer les clés des livres à chaque asso
    results.then((newAssos) => {
      setAssos(assosList.map((asso) => {
        for (let i = 0; i < newAssos[0].length; i += 1) {
          if (asso.asso_id === newAssos[0][i].entity) {
            return { ...asso, book: newAssos[0][i].pk };
          }
        }
        return { ...asso, book: '-1' };
      }));
    });
  }

  // TODO : peut être fetch tous les comptes de toutes les assos pour ne pas fetch une liste
  // à chaque fois que l'utilisateur clique sur le bouton ? après c'est mis en cache du navigateur
  // donc bon... à voir

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
            fetchBookPks(newResponse);
          });
        }
      });
  }, [user]);

  // récupération des comptes de l'association active
  useEffect(() => {
    if (assoActive === '') return;

    let bookPk = -1;
    for (let i = 0; i < assos.length; i += 1) {
      if (assos[i].asso_id === assoActive) {
        bookPk = assos[i].book;
        break;
      }
    }
    fetch(`/api/books/${bookPk}/accounts/`)
      .then((response) => response.json())
      .then((response) => {
        setAccountList(response.account_set);
      });
  }, [assos, assoActive]);

  return (
    <React.StrictMode>
      <AppContext.Provider value={{
        user,
        assos,
        assoActive,
        updateAssoActive: (assoId) => { setAssoActive(assoId); },
        accountList,
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
