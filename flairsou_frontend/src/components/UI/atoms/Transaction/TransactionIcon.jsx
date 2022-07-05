import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

/**
 * Fonction permettant d'obtenir l'icône affichée sur la transaction
 * TODO : passer un callback pour récupérer le clic sur le bouton
 */
const TransactionIcon = ({ transactionPk, transactionReconciliated, modified }) => {
  if (transactionPk !== 0 && modified) {
    return (
      <Icon
        name="save"
        color="orange"
        title="Modification en cours, cliquer pour enregistrer"
      />
    );
  }

  if (transactionReconciliated) {
    return (
      <Icon
        name="lock"
        color="red"
        title="Transaction rapprochée"
      />
    );
  }

  if (transactionPk === 0) {
    return (
      <Icon
        name="arrow alternate circle right"
        color="blue"
        title="Nouvelle transaction"
      />
    );
  }

  return (
    <Icon
      name="unlock"
      color="green"
      title="Transaction non rapprochée"
    />
  );
};

/**
 * TODO
 */
TransactionIcon.propTypes = {
  transactionPk: PropTypes.number.isRequired,
  transactionReconciliated: PropTypes.bool.isRequired,
  modified: PropTypes.bool.isRequired,
};

export default memo(TransactionIcon);
