/* eslint-disable react/jsx-props-no-spreading */

/* Le spreading est utilisé pour la création des routes custom (PrivateRoute)
 Il est plus clair et plus concis que si l'on devait lister tous les props de Route dans
 PrivateRoute et les passer un par un.
*/

import React, { useState, useEffect, memo } from 'react';
import {
  BrowserRouter, Redirect, Route, Switch,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import { AppContext } from './contexts/contexts';

import Home from './pages/home/Home';
import Account from './pages/account/Account';
import Book from './pages/book/Book';
import CrudActions from '../assets/crudActions';
import Logout from './pages/logout/Logout';
import { NotFound } from './pages/errors/Errors';
import Credits from './pages/credits/Credits';

// liste des comptes non virtuels pour sélectionner dans les opérations
const buildOptions = (accountSet) => (
  accountSet.map((account) => (
    account.virtual
      ? buildOptions(account.account_set)
      : <option key={`opt-${account.pk}`} value={account.fullName}>{account.fullName}</option>
  ))
);

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
const authlinkUrl = process.env.BASE_URL.concat('oauth/authlink');
const userInfosUrl = process.env.BASE_URL.concat('proxy_pda/get_user_infos');
const assosUrl = process.env.BASE_URL.concat('proxy_pda/get_list_assos');

const App = () => {
  // informations sur l'utilisateur
  const [user, setUser] = useState({ id: null, firstname: null, lastname: null });

  // liste des assos de l'utilisateur
  const [assos, setAssos] = useState([]);

  // association active dans l'application
  const [assoActive, setAssoActive] = useState(null);

  // liste des comptes liés à l'association active dans l'application
  const [accountList, setAccountList] = useState([]);

  // datalist pour pré-remplir le champ de compte dans les transactions
  const [accountDatalist, setAccountDatalist] = useState(null);

  // clé primaire du compte actif
  const [accountActive, setAccountActive] = useState(-1);

  // message d'erreur
  const [alert, setAlert] = useState({});

  // fonction permettant de récupérer la clé primaire de chaque livre associé à chaque
  // association de la liste fournie, puis de mettre à jour l'état de la liste des
  // assos
  async function fetchBookPks(assosList) {
    // fonction de récupération des livres associés aux entités
    const fetchAssoBook = async (asso) => {
      // appel de l'API pour récupérer le livre associé à l'asso
      const response = await fetch(process.env.BASE_URL.concat(`api/books/byEntity/${asso.asso_id}/`));
      let bookId = '-1';
      if (response.status === 200) {
        const json = await response.json();
        bookId = json[0].pk;
      }

      // récupération récursive des livres pour les sous-assos
      const subAssos = await Promise.all(
        asso.asso_set.map((subAsso) => fetchAssoBook(subAsso)),
      );

      // renvoi du résultat
      return {
        ...asso,
        asso_set: subAssos,
        book: bookId,
      };
    };

    const newAssos = await Promise.all(
      assosList.map((asso) => fetchAssoBook(asso)),
    );
    setAssos(newAssos);
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

  const updateAccountList = () => {
    const bookPk = assoActive.book;

    fetch(process.env.BASE_URL.concat(`api/books/${bookPk}/accounts/`))
      .then((response) => response.json())
      .then((response) => {
        setAccountList(response.account_set);
      });
  };

  // récupération des comptes de l'association active
  useEffect(() => {
    if (assoActive === null) return;

    // réinitialise l'affichage avant de récupérer les nouveaux
    setAccountList([]);
    updateAccountList();
  }, [assos, assoActive]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // création de la datalist de comptes
  useEffect(() => {
    setAccountDatalist(
      <datalist id="accounts">
        {buildOptions(accountList)}
      </datalist>,
    );
  }, [accountList]);

  return (
    <React.StrictMode>
      <AppContext.Provider value={{
        user,
        assos,
        assoActive,
        updateAssoActive: (asso) => { setAssoActive(asso); },
        refreshAccountList: () => { updateAccountList(); },
        accountList,
        accountActive,
        setAccountActive: (accountPk) => { setAccountActive(accountPk); },
        alert,
        setAlert: (newAlert) => { setAlert(newAlert); },
      }}
      >
        {accountDatalist}
        <BrowserRouter basename={process.env.BASE_URL.replace('/', '')}>
          <Switch>
            <Route path="/book" exact>
              <Book />
            </Route>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/logout" exact>
              <Logout />
            </Route>
            <Route path="/accounts/create" exact>
              <Account action={CrudActions.CREATE} />
            </Route>
            <Route path="/accounts/edit/:accountID" exact>
              <Account action={CrudActions.UPDATE} />
            </Route>
            <Route path="/accounts/:accountID" exact>
              <Account action={CrudActions.READ} />
            </Route>
            <Route path="/credits" exact>
              <Credits />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </BrowserRouter>
      </AppContext.Provider>
    </React.StrictMode>
  );
};

export default memo(App);
