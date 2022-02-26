import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import ErrorLevels from '../../../assets/errorLevels';

const Error = ({ message, level }) => (
  <Redirect to={{
    pathname: '/',
    state: {
      alert: {
        message,
        level,
      },
    },
  }}
  />
);

Error.propTypes = {
  message: PropTypes.string,
  level: PropTypes.number,
};

Error.defaultProps = {
  message: 'Unknown error',
  level: ErrorLevels.ERROR,
};

export const Unknown = () => <Error />;
export const NotFound = () => <Error message="404 - T'es-tu perdu ?" level={ErrorLevels.WARN} />;
export const Forbidden = () => <Error message="403 - Accès interdit" level={ErrorLevels.ERROR} />;
