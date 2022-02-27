import React, { Fragment, useContext } from 'react';
import './navbar.css';

import { List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import SearchBar from '../../atoms/SearchBar/SearchBar';
import { AppContext } from '../../../contexts/contexts';
import NavAccount from '../../atoms/NavAccount/NavAccount';

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
        />
        <List.Content
          onClick={() => { handleClick(asso); }}
        >
          <Link to="/book">
            {prefix}
            {asso.shortname}
          </Link>
        </List.Content>
        {
          (appContext.assoActive && appContext.assoActive.asso_id === asso.asso_id)
          && (
            <List.List>
              {
                  appContext.accountList.map((account) => (
                    <NavAccount key={`acc-${account.pk}`} account={account} />))
              }
            </List.List>
          )
        }
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

export default Navbar;
