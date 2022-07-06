import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { cloneDeep } from 'lodash';

import TransactionLine from './TransactionLine';
import TransactionDetail from './TransactionDetail';

/**
 * Vérification de l'égalité entre deux transactions. Cette fonction se base sur le contenu
 * des transactions renvoyé par l'API pouvant être modifiés directement par l'interface.
 * Cette fonction ne tient pas compte des pièces justificatives associées aux transactions
 * car l'ajout ou la suppression des PJ entraîneront une mise à jour directe de la transaction.
 * L'intérêt de cette fonction est de ne vérifier que les composantes propres aux transactions
 * et pas les éléments annexes ajoutés pour la gestion de l'interface (clés locales...)
 */
const transactionEqual = (tr1, tr2) => {
  // paramètres propres à la transaction
  if (tr1.pk !== tr2.pk) return false;
  if (tr1.date !== tr2.date) return false;
  if (tr1.checked !== tr2.checked) return false;

  // nombre d'opérations
  if (tr1.operations.length !== tr2.operations.length) return false;
  // contenu des opérations
  for (let i = 0; i < tr1.operations.length; i += 1) {
    if (tr1.operations[i].pk !== tr2.operations[i].pk) return false;
    if (tr1.operations[i].credit !== tr2.operations[i].credit) return false;
    if (tr1.operations[i].debit !== tr2.operations[i].debit) return false;
    if (tr1.operations[i].label !== tr2.operations[i].label) return false;
    if (tr1.operations[i].account !== tr2.operations[i].account) return false;
  }

  return true;
};

const DisplayTypes = {
  list: 'list', /** affichage de la transaction dans la liste des transactions d'un compte */
  details: 'details', /** affichage des détails d'une transaction sur une page séparée */
};

/**
 * Composant permettant de réaliser une abstraction de la transaction, indépendamment
 * de son mode d'affichage. Le composant prend en charge le maintien de l'objet
 * transaction en mémoire et l'interaction avec l'API (création, modification et
 * suppression).
 */
const AbstractTransaction = ({
  initialTransaction, readOnly, displayType,
  transactionCreatedCallback, transactionUpdatedCallback, transactionDeletedCallback,
}) => {
  /**
   * état interne de la transaction enregistrée, similaire à initialTransaction mais maintenu
   * à jour par rapport aux modifications effectuées dans l'interface
   */
  const [transaction, setTransaction] = useState(cloneDeep(initialTransaction));

  /**
   * état indiquant si la transaction est en cours de modification ou non par rapport
   * à la transaction initiale
   */
  const [modified, setModified] = useState(false);

  // mise à jour du statut de modification
  useEffect(() => {
    if (!transactionEqual(transaction, initialTransaction)) setModified(true);
    else setModified(false);
  }, [transaction, initialTransaction]);

  // mise à jour du solde de la transaction à afficher
  useEffect(() => {
    setTransaction((tr) => ({ ...tr, balance: initialTransaction.balance }));
  }, [initialTransaction]);

  /**
   * Callback de mise à jour de la date dans la transaction.
   */
  const dateUpdated = (event) => {
    setTransaction({ ...transaction, date: event.target.value });
  };

  /**
   * Callback de mise à jour de l'état de check de la transaction
   */
  const checkedUpdated = (data) => {
    setTransaction({ ...transaction, checked: data.checked });
  };

  /**
   * Callback de mise à jour de toutes les opérations de la transaction
   */
  const updateOperations = (updatedOperations) => {
    setTransaction({ ...transaction, operations: updatedOperations });
  };

  /**
   * Callback de mise à jour d'une opération de la transaction
   */
  const updateOperation = (updatedOperation, operationId) => {
    const newOperations = transaction.operations.map((operation, opId) => {
      if (opId === operationId) return updatedOperation;
      return operation;
    });

    updateOperations(newOperations);
  };

  /**
   * Fonction de validation de la transaction par l'API.
   *
   * Cette fonction envoie la requête API pour créer ou mettre à jour la transaction.
   * Si l'API répond correctement (la requête a bien abouti), la fonction de callback
   * est appelée pour permettre la mise à jour du composant parent.
   */
  const validateTransaction = () => {
    // méthode à utiliser pour envoyer la transaction, POST pour créer et
    // PUT pour mettre à jour
    const method = transaction.pk === 0 ? 'POST' : 'PUT';

    const URL = `${process.env.BASE_URL}api/transactions/${transaction.pk === 0 ? '' : `${transaction.pk}/`}`;

    // corps de la requête (contenu de la transaction)
    const body = {
      date: transaction.date,
      checked: transaction.checked,
      invoice: null,
      operations: transaction.operations.map((operation) => ({
        pk: operation.pk,
        credit: operation.credit,
        debit: operation.debit,
        label: operation.label,
        account: operation.account,
      })),
    };

    // si la transaction existe et qu'elle est mise à jour, on ajoute la clé primaire au corps
    // de la requête
    if (transaction.pk !== 0) {
      body.pk = transaction.pk;
    }

    fetch(URL,
      {
        method,
        // construction de l'objet transaction à envoyer à l'API
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        // TODO : mettre la gestion d'erreur sur le retour ici
        if (transaction.pk === 0) {
          // création
          transactionCreatedCallback(response);
        } else {
          // mise à jour
          transactionUpdatedCallback(response);
        }
      });
  };

  /**
   * Suppression de la transaction
   */
  const deleteTransaction = () => {
    fetch(`${process.env.BASE_URL}api/transactions/${transaction.pk}/`, { method: 'DELETE' })
      .then((response) => {
        transactionDeletedCallback(response, transaction.pk);
      });
  };

  const readOnlyTransaction = transaction.is_reconciliated || readOnly;

  /**
   * Modification de l'affichage en fonction du type de rendu désiré
   */
  switch (displayType) {
    case DisplayTypes.list:
      return (
        <TransactionLine
          transaction={transaction}
          modified={modified}
          readOnly={readOnlyTransaction}
          updateDate={dateUpdated}
          updateCheck={checkedUpdated}
          updateOperation={updateOperation}
          updateOperations={updateOperations}
          validateTransaction={validateTransaction}
          deleteTransaction={deleteTransaction}
        />
      );
    case DisplayTypes.details:
      return (
        <TransactionDetail
          transaction={transaction}
          modified={modified}
          readOnly={readOnlyTransaction}
          updateDate={dateUpdated}
          updateCheck={checkedUpdated}
          updateOperation={updateOperation}
          updateOperations={updateOperations}
          validateTransaction={validateTransaction}
          deleteTransaction={deleteTransaction}
        />
      );
    default:
      // TODO gestion d'erreur ici ?
      return (<></>);
  }
};

AbstractTransaction.propTypes = {
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
    balance: PropTypes.number,
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
  /**
   * Flag indiquant si la transaction doit être considérée en lecture seule ou non
   */
  readOnly: PropTypes.bool.isRequired,
  /**
   * TODO
   */
  displayType: PropTypes.oneOf(Object.keys(DisplayTypes)).isRequired,
  transactionCreatedCallback: PropTypes.func.isRequired,
  transactionUpdatedCallback: PropTypes.func.isRequired,
  transactionDeletedCallback: PropTypes.func.isRequired,
};

export default memo(AbstractTransaction);
export { DisplayTypes };
