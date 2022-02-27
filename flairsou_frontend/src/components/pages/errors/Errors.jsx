import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import ErrorLevels from '../../../assets/errorLevels';
import { AppContext } from '../../contexts/contexts';

/**
 * Système d'alerte - envoie une alerte dans le contexte de l'app et redirige à la racine
 *
 * @param {string} message - Message à afficher.
 * @param {number} level - Niveau de l'erreur.
 * @returns {JSX.Element} - Redirection vers la racine.
 */
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
