import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Container, Menu, Segment, Visibility,
} from 'semantic-ui-react';

import MenuItems from '../menu/MenuItems';

const DesktopContainer = ({ children, location }) => {
  const [fixed, setFixed] = useState(false);

  return (
    <>
      <Visibility
        once={false}
        onBottomPassed={() => setFixed(true)}
        onBottomPassedReverse={() => setFixed(false)}
      >
        <Segment
          inverted
          textAlign="center"
          style={{ padding: '1em 0em' }}
          vertical
        >
          <Menu
            fixed={fixed ? 'top' : null}
            inverted={!fixed}
            pointing={!fixed}
            secondary={!fixed}
            size="large"
          >
            <Container>
              <Menu.Header as="h1" style={{ padding: '0em 1em' }}>Flairsou</Menu.Header>
            </Container>
            <Container>
              <MenuItems fixed={fixed} activeItem={location.pathname} />
            </Container>
          </Menu>
        </Segment>
      </Visibility>

      {children}
    </>
  );
};

DesktopContainer.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
};

export default DesktopContainer;
