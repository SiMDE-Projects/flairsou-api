import React, { useContext } from 'react';
import logo from '../../../../assets/logo.svg';
import './header.css';

import { AppContext } from '../../../contexts/contexts';

const Header = () => {
  const appContext = useContext(AppContext);

  return (
    <div className="header">
      <div className="flairsou-logo">
        <img src={logo} alt="logo de flairsou" className="flairsou-image" />
        <h1 className="flairsou-title">Flairsou</h1>
      </div>

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

export default Header;
