import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../molecules/Header/Header';
import Navbar from '../../molecules/Navbar/Navbar';
import './ContentWrapper.css';

const ContentWrapper = ({ content }) => (
  <div className="content-wrapper-v">
    <Header />
    <div className="content-wrapper-h">
      <Navbar />
      {content}
    </div>
  </div>
);

ContentWrapper.propTypes = {
  content: PropTypes.node.isRequired,
};

export default ContentWrapper;
