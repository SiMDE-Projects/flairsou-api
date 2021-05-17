import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Sidebar, Segment, Icon,
} from 'semantic-ui-react';

import MenuItems from '../menu/MenuItems';

const MobileContainer = ({ children, location }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar.Pushable>
        <Sidebar as={Menu} animation="overlay" inverted vertical visible={sidebarOpen}>
          <MenuItems
            fixed={false}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            activeItem={location.pathname}
          />
        </Sidebar>
        <Sidebar.Pusher
          onClick={() => {
            if (sidebarOpen) setSidebarOpen(false);
          }}
          dimmed={sidebarOpen}
          style={{ minHeight: '100vh' }}
        >
          <Segment
            inverted
            vertical
          >
            <Menu inverted pointing secondary size="large">
              <Menu.Item onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Icon name="sidebar" />
              </Menu.Item>
            </Menu>
          </Segment>

          {children}
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </>
  );
};

MobileContainer.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
};

export default MobileContainer;
