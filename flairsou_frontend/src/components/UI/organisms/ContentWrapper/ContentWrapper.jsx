import React, { memo, useContext } from 'react';
import PropTypes from 'prop-types';
import { Container, Message } from 'semantic-ui-react';

import Header from '../../molecules/Header/Header';
import Navbar from '../../molecules/Navbar/Navbar';
import Footer from '../../molecules/Footer/Footer';
import './ContentWrapper.css';
import ErrorLevels from '../../../../assets/errorLevels';
import { AppContext } from '../../../contexts/contexts';

const ContentWrapper = ({ content }) => {
  const appContext = useContext(AppContext);

  // Système de message pour alerting
  const messageProps = {};
  messageProps.info = appContext.alert?.level === ErrorLevels.INFO;
  messageProps.warning = appContext.alert?.level === ErrorLevels.WARN;
  messageProps.error = appContext.alert?.level === ErrorLevels.ERROR;
  if (messageProps.info) {
    messageProps.header = 'Information';
  } else if (messageProps.warning) {
    messageProps.header = 'Avertissement';
  } else if (messageProps.error) {
    messageProps.header = 'Erreur';
  }

  return (
    <div className="content-wrapper-v">
      <Header />
      <div className="content-wrapper-h">
        <Navbar />
        <div className="final-content">
          {appContext.alert?.message && (
            <Container text>
              <Message
                compact
                info={messageProps.info}
                warning={messageProps.warning}
                error={messageProps.error}
                header={messageProps.header}
                onDismiss={() => { appContext.setAlert({}); }}
                content={appContext.alert.message}
              />
            </Container>
          )}
          {content}
        </div>
      </div>
      <Footer />
    </div>
  );
};

ContentWrapper.propTypes = {
  content: PropTypes.node.isRequired,
};

export default memo(ContentWrapper);
