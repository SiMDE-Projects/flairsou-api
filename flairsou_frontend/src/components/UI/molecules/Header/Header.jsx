import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../../../assets/logo.svg';
import './header.css';

const Header = ({ userName }) => (
  <header>
    <div className="flairsou-logo">
      <img src={logo} alt="logo de flairsou" className="flairsou-image" />
      <h1 className="flairsou-title">Flairsou</h1>
    </div>

    <div className="user-info-block">
      <p>{userName}</p>
      <a className="deco-button" href="#"> déconnexion </a>
    </div>
  </header>
);

Header.propTypes = {
  userName: PropTypes.string.isRequired,
};

export default Header;
