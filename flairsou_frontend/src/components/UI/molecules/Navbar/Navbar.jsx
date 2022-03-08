import React, { Fragment, memo, useContext } from 'react';
import './navbar.css';

import { List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import SearchBar from '../../atoms/SearchBar/SearchBar';
import { AppContext } from '../../../contexts/contexts';
import NavAccount from '../../atoms/NavAccount/NavAccount';

// déploie l'arbre des comptes dans la navbar récursivement en adaptant le
// niveau de profondeur
const expandAccountTree = (accountList, depth = 0) => (
  accountList.map((account) => (
    <Fragment key={`acc-${account.pk}`}>
      <NavAccount account={account} depth={depth} />
      {expandAccountTree(account.account_set, depth + 1)}
    </Fragment>
  ))
);

const Navbar = () => {
  const appContext = useContext(AppContext);

  const handleClick = (asso) => {
    // toogle l'association active dans le contexte
    if (asso === appContext.assoActive) {
      appContext.updateAssoActive(null);
    } else {
      appContext.updateAssoActive(asso);
    }
  };

  const assoElement = (asso, prefix = '') => (
    <Fragment key={`${prefix}asso-${asso.asso_id}`}>
      <List.Item>
        <List.Icon
          name={(appContext.assoActive && appContext.assoActive.asso_id === asso.asso_id)
            ? 'caret down' : 'caret right'}
          onClick={() => { handleClick(asso); }}
        />
        <List.Content>
          <Link to="/book" onClick={() => { handleClick(asso); }}>
            {prefix}
            {asso.shortname}
          </Link>
          {
            appContext.assoActive && appContext.assoActive.asso_id === asso.asso_id
            && expandAccountTree(appContext.accountList)
          }
        </List.Content>
      </List.Item>
      {
        asso.asso_set.map((subasso) => (
          assoElement(subasso, `${asso.shortname}/`)
        ))
      }
    </Fragment>
  );

  return (
    <div className="navbar">
      <SearchBar />
      <List>
        {
          appContext.assos.map((asso) => (
            assoElement(asso)
          ))
        }
      </List>
    </div>
  );
};

export default memo(Navbar);
