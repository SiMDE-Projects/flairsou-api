import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Icon,
} from 'semantic-ui-react';
import Operation, { NO_ACCOUNT } from './Operation/Operation';

/**
 * TODO
 */
const MultiOpsTransaction = ({
  initialTransaction, expandCallback,
}) => {
  /**
   * Opération à afficher pour la transaction multiple. On utilise ici une opération
   * factice qui n'existe pas réellement en base mais qui correspond à ce qu'on veut
   * afficher, pour exploiter le composant Operation.
   */
  const [displayOperation, setDisplayOperation] = useState(null);

  /**
   * Indique si la transaction doit être étendue ou non (i.e. si il faut
   * afficher toutes les opérations de la transaction)
   */
  const [expand, setExpand] = useState(false);

  const toogleExpand = () => {
    setExpand(!expand);
  };

  // initialisation de la transaction d'affichage
  useEffect(() => {
    const { activeOpId } = initialTransaction;
    setDisplayOperation({
      pk: 0,
      credit: initialTransaction.operations[activeOpId].credit,
      debit: initialTransaction.operations[activeOpId].debit,
      account: NO_ACCOUNT,
      accountFullName: '',
      label: initialTransaction.operations[activeOpId].label,
    });
  }, [initialTransaction]);

  // appel du callback d'extension si le flag est modifié
  useEffect(() => {
    expandCallback(expand);
  }, [expand, expandCallback]);

  if (!displayOperation) {
    return (<></>);
  }

  /**
   * Composant à cliquer pour déployer la transaction multiple
   */
  const clickToExpand = (
    <div
      onClick={() => toogleExpand()}
      onKeyDown={(event) => { if (event.key === 'Enter') toogleExpand(); }}
      role="button"
      tabIndex={0}
      title="Cliquer pour déplier/replier la transaction"
    >
      Transaction répartie&nbsp;
      <Icon
        link
        name={expand ? 'angle double up' : 'angle double down'}
        title={`${expand ? 'Replier' : 'Déplier'} la transaction`}
      />
    </div>
  );

  return (
    <Operation
      initialOp={displayOperation}
      clickToExpand={clickToExpand}
      active={false}
      readOnly
      updateCallback={(updatedOp) => {}} /* eslint-disable-line no-unused-vars */
      operationValidatedCallback={() => {}}
    />
  );
};

MultiOpsTransaction.propTypes = {
  /** objet transaction à afficher */
  initialTransaction: PropTypes.shape({
    // clé primaire de la transaction dans la base de l'API
    pk: PropTypes.number.isRequired,
    // date de la transaction
    date: PropTypes.string.isRequired,
    // indique si la transaction est rapprochée ou non. Une transaction rapprochée passe
    // en lecture seule
    is_reconciliated: PropTypes.bool.isRequired,
    // indique si la transaction est pointée ou non (quand une transaction saisie
    // et constatée sur le compte en ligne, l'utilisateur peut la pointer pour indiquer
    // qu'elle est correctement saisie)
    checked: PropTypes.bool.isRequired,
    // justificatif associé à la transaction (TODO)
    invoice: PropTypes.string,
    // solde partiel suite à cette transaction
    balance: PropTypes.number.isRequired,
    // ID de l'opération active dans la transaction
    activeOpId: PropTypes.number.isRequired,
    // liste des opérations associées à la transaction
    operations: PropTypes.arrayOf(PropTypes.shape({
      // clé primaire de l'opération dans la base de l'API
      pk: PropTypes.number.isRequired,
      // montant associé au crédit (centimes)
      credit: PropTypes.number.isRequired,
      // montant associé au débit (centimes)
      debit: PropTypes.number.isRequired,
      // label associé à l'opération
      label: PropTypes.string.isRequired,
      // clé primaire du compte lié à l'opération
      account: PropTypes.number.isRequired,
      // nom complet du compte lié à l'opération
      accountFullName: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
  expandCallback: PropTypes.func.isRequired,
};

export default memo(MultiOpsTransaction);
