import React, { memo, useContext } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../../assets/logo.svg';
import './header.css';

import { AppContext } from '../../../contexts/contexts';

const Header = () => {
  const appContext = useContext(AppContext);

  return (
    <div className="flairsou-header">
      {/* le Link sera rendu comme /<basename>/ défini dans le routeur dans App */}
      <Link to="/">
        <div className="flairsou-logo">
          <img src={logo} alt="logo de flairsou" className="flairsou-image" />
          <h1 className="flairsou-title">Flairsou</h1>
        </div>
      </Link>

      <p>
        {
          appContext.user.id
            ? `${appContext.user.firstname} ${appContext.user.lastname}`
            : 'Non connecté'
        }
      </p>
    </div>
  );
};

export default memo(Header);
