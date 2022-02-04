import React from 'react';
import logo from '../../../../assets/logo.svg';
import './header.css';

const Header = ({ connected }) => (
  <div className="header">
    <div className="flairsou-logo">
      <img src={logo} alt="logo de flairsou" className="flairsou-image" />
      <h1 className="flairsou-title">Flairsou</h1>
    </div>

    <a className="deco-button" href="#"> déconnexion </a>
  </div>
);

export default Header;
