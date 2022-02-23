import React, { useContext } from 'react';
import './navbar.css';

import { List } from 'semantic-ui-react';
import SearchBar from '../../atoms/SearchBar/SearchBar';
import { AppContext } from '../../../contexts/contexts';
import NavAccount from '../../atoms/NavAccount/NavAccount';

const Navbar = () => {
  const appContext = useContext(AppContext);

  const handleClick = (assoId) => {
    // toogle l'association active dans le contexte
    if (assoId === appContext.assoActive) {
      appContext.updateAssoActive('');
    } else {
      appContext.updateAssoActive(assoId);
    }
  };

  return (
    <div className="navbar">
      <SearchBar />
      <List>
        {
          appContext.assos.map((asso) => (
            <List.Item
              key={`asso-${asso.asso_id}`}
            >
              <List.Icon
                name={appContext.assoActive === asso.asso_id ? 'caret down' : 'caret right'}
              />
              <List.Content
                onClick={() => { handleClick(asso.asso_id); }}
              >
                {asso.shortname}
              </List.Content>
              {
                appContext.assoActive === asso.asso_id
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
          ))
        }
      </List>
    </div>
  );
};

export default Navbar;
