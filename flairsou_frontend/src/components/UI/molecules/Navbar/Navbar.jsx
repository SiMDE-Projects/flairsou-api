import React, { useContext } from 'react';
import './navbar.css';

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
      {
        appContext.assos.map((asso) => (
          <div key={`asso-${asso.asso_id}`}>
            <button
              className={`navbar-element ${appContext.assoActive === asso.asso_id ? 'active' : ''}`}
              type="button"
              onClick={() => { handleClick(asso.asso_id); }}
            >
              <p>{asso.shortname}</p>
            </button>
            <ul>
              {
                appContext.assoActive === asso.asso_id
                && appContext.accountList.map((account) => (
                  <NavAccount key={`acc-${account.pk}`} account={account} />))
              }
            </ul>
          </div>
        ))
      }
    </div>
  );
};

export default Navbar;
