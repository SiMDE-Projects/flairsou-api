import React from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import { createMedia } from '@artsy/fresnel';
import { Container } from 'semantic-ui-react';

import DesktopContainer from './DesktopContainer';
import MobileContainer from './MobileContainer';

const AppMedia = createMedia({
  breakpoints: {
    mobile: 320,
    computer: 992,
  },
});

const mediaStyles = AppMedia.createMediaStyle();
const { Media, MediaContextProvider } = AppMedia;

const PageContainer = ({ children, location }) => (
  <>
    <style>{mediaStyles}</style>
    <MediaContextProvider>
      <Container fluid as={Media} at="mobile">
        <MobileContainer location={location}>
          {children}
        </MobileContainer>
      </Container>
      <Container fluid as={Media} greaterThanOrEqual="computer">
        <DesktopContainer location={location}>
          {children}
        </DesktopContainer>
      </Container>
    </MediaContextProvider>
  </>
);

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
};

export default withRouter(PageContainer);
