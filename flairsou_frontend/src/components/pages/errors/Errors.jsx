import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import ErrorLevels from '../../../assets/errorLevels';
import { AppContext } from '../../contexts/contexts';

const Error = ({ message, level }) => {
  const appContext = useContext(AppContext);

  appContext.setAlert({ message, level });

  return <Redirect to={{ pathname: '/' }} />;
};

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
export const Forbidden = ({ message }) => <Error message={message || '403 - Accès interdit'} level={ErrorLevels.ERROR} />;

Forbidden.propTypes = {
  message: PropTypes.string,
};

Forbidden.defaultProps = {
  message: null,
};
