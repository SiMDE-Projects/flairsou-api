import React, { memo } from 'react';
import { Input } from 'semantic-ui-react';

const SearchBar = () => (
  <Input icon="search" iconPosition="left" placeholder="recherche..." fluid />
);

export default memo(SearchBar);
