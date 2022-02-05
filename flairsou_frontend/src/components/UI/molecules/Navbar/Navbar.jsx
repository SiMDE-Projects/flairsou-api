import React, { useContext } from 'react';
import './navbar.css';

import SearchBar from '../../atoms/SearchBar/SearchBar';
import { UserContext } from '../../../helpers/Provider';

const Navbar = () => {
  const { user, loadUser } = useContext(UserContext);

  const handleClick = (assoId) => {
    const newAssos = user.assos;
    for (let i = 0; i < user.assos.length; i += 1) {
      if (user.assos[i].asso_id === assoId) {
        newAssos[i].active = !newAssos[i].active;
      }
    }
    loadUser({ ...user, assos: newAssos });
  };

  return (
    <div className="navbar">
      <SearchBar />
      {user.assos.map((asso) => (
        <button key={asso.asso_id} className={`navbar-element ${asso.active ? 'active' : ''}`} type="button" onClick={() => { handleClick(asso.asso_id); }}>
          <svg height="10" width="10">
            <polygon points={`0,0 5,${Math.sqrt(75)} 10,0`} className="triangle" />
            Sorry, your browser does not support inline SVG.
          </svg>
          <p>{asso.name}</p>
        </button>
      ))}
    </div>
  );
};

export default Navbar;
