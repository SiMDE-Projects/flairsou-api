import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { cloneDeep } from 'lodash';
import Operation from './Operation/Operation';

// détermine l'ID de l'autre opération dans le tableau. Comme il n'y en a que
// deux (0 et 1), on fait +1 puis %2 pour avoir 1 -> 0 et 0 -> 1.
const otherOpId = (activeOpId) => ((activeOpId + 1) % 2);

/**
 * Transaction simple avec uniquement 2 opérations. Cette transaction dispose d'un composant
 * particulier car l'affichage d'une transaction simple ne correspond pas directement à
 * l'affichage de ses opérations : comme on affiche une seule ligne, il faut à la fois
 * afficher les infos de l'opération liée au compte affiché (label, crédit, débit) et
 * l'information sur le compte associé à l'autre opération. On a donc un affichage et un traitement
 * particulier pour ce type de transaction simple.
 */
const OneLineTransaction = ({
  initialTransaction, readOnly,
  operationsUpdatedCallback, transactionValidatedCallback,
}) => {
  /**
   * état des opérations de la transaction. Il s'agit ici de 2 opérations car on est sur
   * une transaction simple.
   */
  const [operations, setOperations] = useState(cloneDeep(initialTransaction.operations));

  /**
   * Opération à afficher dans la transaction simple. On utilise ici une opération
   * factice qui n'existe pas réellement en base mais qui correspond à ce qu'on veut
   * afficher, pour exploiter le composant Operation.
   */
  const [displayOperation, setDisplayOperation] = useState(null);

  // initialisation de la transaction d'affichage
  useEffect(() => {
    setDisplayOperation({
      pk: 0,
      credit: operations[initialTransaction.activeOpId].credit,
      debit: operations[initialTransaction.activeOpId].debit,
      account: operations[otherOpId(initialTransaction.activeOpId)].account,
      accountFullName: operations[otherOpId(initialTransaction.activeOpId)].accountFullName,
      label: operations[initialTransaction.activeOpId].label,
    });
  }, [initialTransaction.activeOpId, operations]);

  // l'opération affichée a été modifiée, on répercute les modifications sur la
  // transaction actuelle
  const operationUpdated = (updatedOperations) => {
    // nouvel objet transaction (copie profonde)
    const newOperations = cloneDeep(operations);

    // mise à jour du label dans les 2 opérations de la transaction
    for (let i = 0; i < 2; i += 1) {
      newOperations[i].label = updatedOperations.label;
    }

    const { activeOpId } = initialTransaction;

    // mise à jour des crédits et débits
    // sur l'opération active, on recopie la nouvelle opération, et sur l'autre on inverse
    newOperations[activeOpId].credit = updatedOperations.credit;
    newOperations[activeOpId].debit = updatedOperations.debit;
    newOperations[otherOpId(activeOpId)].credit = updatedOperations.debit;
    newOperations[otherOpId(activeOpId)].debit = updatedOperations.credit;

    // mise à jour du compte pointé sur l'autre opération
    newOperations[otherOpId(activeOpId)].account = updatedOperations.account;
    newOperations[otherOpId(activeOpId)].accountFullName = updatedOperations.accountFullName;

    // mise à jour de l'état interne
    setOperations(newOperations);

    // remontée de la mise à jour dans AbstractTransaction
    operationsUpdatedCallback(newOperations);
  };

  if (!displayOperation) {
    return (<></>);
  }

  return (
    <Operation
      initialOp={displayOperation}
      clickToExpand={null}
      active={false}
      readOnly={readOnly}
      updateCallback={(updatedOp) => operationUpdated(updatedOp)}
      operationValidatedCallback={transactionValidatedCallback}
    />
  );
};

OneLineTransaction.propTypes = {
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
  readOnly: PropTypes.bool.isRequired,
  operationsUpdatedCallback: PropTypes.func.isRequired,
  transactionValidatedCallback: PropTypes.func.isRequired,
};

export default memo(OneLineTransaction);
