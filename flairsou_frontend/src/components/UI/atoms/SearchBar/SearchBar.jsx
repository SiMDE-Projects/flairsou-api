import React from 'react';
import './searchBar.css';
import { Input } from 'semantic-ui-react';
import lens from '../../../../assets/lens.svg';

const SearchBar = () => (
  <div className="search-bar">
    <img src={lens} alt="lens pictogram" />
    <Input type="text" placeholder="recherche..." />
  </div>

);

export default SearchBar;
