import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Container, Message } from 'semantic-ui-react';

import Header from '../../molecules/Header/Header';
import Navbar from '../../molecules/Navbar/Navbar';
import './ContentWrapper.css';
import ErrorLevels from '../../../../assets/errorLevels';

const ContentWrapper = ({ content }) => {
  const location = useLocation();
  const [messageVisible, setMessageVisible] = useState(true);

  const messageProps = {};
  messageProps.info = location.state?.alert?.level === ErrorLevels.INFO;
  messageProps.warning = location.state?.alert?.level === ErrorLevels.WARN;
  messageProps.error = location.state?.alert?.level === ErrorLevels.ERROR;
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
          {messageVisible && location.state?.alert && (
            <Container text>
              <Message
                compact
                info={messageProps.info}
                warning={messageProps.warning}
                error={messageProps.error}
                header={messageProps.header}
                onDismiss={() => { setMessageVisible(false); }}
                content={location.state.alert.message}
              />
            </Container>
          )}
          {content}
        </div>
      </div>
    </div>
  );
};

ContentWrapper.propTypes = {
  content: PropTypes.node.isRequired,
};

export default ContentWrapper;
