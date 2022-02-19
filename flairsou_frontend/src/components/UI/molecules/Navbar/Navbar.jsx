import React, { useContext } from 'react';
import './navbar.css';

import SearchBar from '../../atoms/SearchBar/SearchBar';
import { AppContext } from '../../../contexts/contexts';

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
          <button
            key={asso.asso_id}
            className={`navbar-element ${appContext.assoActive === asso.asso_id ? 'active' : ''}`}
            type="button"
            onClick={() => { handleClick(asso.asso_id); }}
          >
            <svg height="10" width="10">
              <polygon points={`0,0 5,${Math.sqrt(75)} 10,0`} className="triangle" />
              Sorry, your browser does not support inline SVG.
            </svg>
            <p>{asso.shortname}</p>
          </button>
        ))
      }
    </div>
  );
};

export default Navbar;
