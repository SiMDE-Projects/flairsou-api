import React from 'react';
import './searchBar.css';
import lens from '../../../../assets/lens.svg';

const SearchBar = () => (
  <div className="search-bar">
    <img src={lens} alt="lens image" />
    <input type="text" placeholder="recherche..." />
  </div>

);

export default SearchBar;
