import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon } from 'semantic-ui-react';

import Operation from './Operation/Operation';
import currencyFormat from '../../../../utils/currencyFormat';

/**
 * Composant effectuant le rendu d'une transaction dans l'affichage d'un compte
 */
const Transaction = ({ transaction }) => {
  // indique si la transaction doit être étendue ou non (i.e. si il faut
  // afficher toutes les opérations de la transaction)
  const [expand, setExpand] = useState(false);

  const toogleExpand = () => {
    setExpand(!expand);
  };

  // récupération de l'objet correspondant à l'opération à afficher
  const currentOp = transaction.operations[transaction.currentOpId];

  // détermination si la transaction est simple ou répartie
  const multiOps = transaction.operations.length > 2;

  // récupération du nom de l'autre compte (s'il n'y en a qu'un)
  let otherAccountName = '';
  if (!multiOps) {
    // détermine l'ID de l'autre opération dans le tableau. Comme il n'y en a que
    // deux (0 et 1), on fait +1 puis %2 pour avoir 1 -> 0 et 0 -> 1.
    const otherOpId = (transaction.currentOpId + 1) % 2;
    otherAccountName = <>{transaction.operations[otherOpId].accountFullName}</>;
  } else {
    // si la transaction est répartie, on crée directement un composant qui affiche
    // la transaction répartie et un petit icône qui permet de déplier la transaction
    otherAccountName = (
      <>
        Transaction répartie&nbsp;
        <Icon
          link
          name={expand ? 'angle double up' : 'angle double down'}
          onClick={toogleExpand}
        />
      </>
    );
  }

  return (
    <>
      <Table.Row>
        <Table.Cell textAlign="center">
          <Icon
            name={transaction.is_reconciliated ? 'lock' : 'unlock'}
            color={transaction.is_reconciliated ? 'red' : 'green'}
          />
        </Table.Cell>
        <Table.Cell>{transaction.date}</Table.Cell>
        <Operation
          operation={currentOp}
          accountName={otherAccountName}
          active={false}
        />
        <Table.Cell textAlign="right">{currencyFormat(transaction.balance)}</Table.Cell>
        <Table.Cell textAlign="center">o</Table.Cell>
      </Table.Row>
      {
        // si il faut étendre la transaction, on rajoute autant de lignes que nécessaire
        expand && transaction.operations.map((operation) => (
          <Table.Row>
            <Table.Cell colSpan="2" />
            <Operation
              operation={operation}
              accountName={operation.accountFullName}
              active={operation.pk === currentOp.pk}
            />
            <Table.Cell colSpan="2" />
          </Table.Row>
        ))
      }
    </>
  );
};

Transaction.propTypes = {
  // objet transaction à afficher
  transaction: PropTypes.shape({
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
    balance: PropTypes.number.isRequired,
    // solde partiel suite à cette transaction
    currentOpId: PropTypes.number.isRequired,
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
};

export default Transaction;
