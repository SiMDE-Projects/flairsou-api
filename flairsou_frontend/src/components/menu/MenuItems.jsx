import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

const MenuItems = ({ activeItem, onClick }) => (
  <>
    <Menu.Item as={Link} to="/" name="/" active={activeItem === '/'} onClick={onClick}>
      Home
    </Menu.Item>
    <Menu.Item as={Link} to="/test" name="/test" active={activeItem === '/test'} onClick={onClick}>
      TestPage
    </Menu.Item>
  </>
);

MenuItems.propTypes = {
  activeItem: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

MenuItems.defaultProps = {
  onClick: () => {},
};

export default MenuItems;
