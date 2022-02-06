import React from 'react';
import propTypes from 'prop-types';
import Header from '../../molecules/Header/Header';
import Navbar from '../../molecules/Navbar/Navbar';
import './ContentWrapper.css';

const ContentWrapper = ({ userName, content }) => (
  <div className="content-wrapper-v">
    <Header userName={userName} />
    <div className="content-wrapper-h">
      <Navbar />
      {content}
    </div>
  </div>
);

export default ContentWrapper;
