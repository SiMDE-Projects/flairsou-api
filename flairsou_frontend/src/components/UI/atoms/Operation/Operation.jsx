import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Input } from 'semantic-ui-react';

import currencyFormat from '../../../../utils/currencyFormat';

const Operation = ({ transaction }) => {
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
    const otherOpId = (transaction.currentOpId + 1) % 2;
    otherAccountName = transaction.operations[otherOpId].accountFullName;
  } else {
    otherAccountName = 'Transaction répartie';
  }

  /** ***********************************************************
   * fonction permettant le rendu d'une opération particulière
   * operation : objet contenant les informations de l'opération à afficher
   * expandedLine : flag indiquant si la ligne dans laquelle l'opération est ajoutée
   *                est une ligne ajoutée (donc une ligne de répartition de la transaction)
   * ********************************************************** */
  function renderOperation(operation, expandedLine) {
    const credit = operation.credit > 0 ? currencyFormat(operation.credit) : '';
    const debit = operation.debit > 0 ? currencyFormat(operation.debit) : '';

    // l'opération active est forcément une ligne expanded
    const active = expandedLine && operation.pk === currentOp.pk;

    return (
      <>
        <Table.Cell active={active}>
          {operation.label}
        </Table.Cell>
        <Table.Cell active={active}>
          {
            // sur une ligne expanded, on affiche le nom du compte, sinon on affiche
            // le nom du compte en face
            expandedLine ? operation.accountFullName : otherAccountName
          }
          {' '}
          {
            // on affiche la flèche si c'est une transaction répartie mais seulement
            // pour la première ligne (donc pas pour les lignes expanded)
            multiOps && !expandedLine
              ? (
                <Icon
                  link
                  name={expand ? 'angle double up' : 'angle double down'}
                  onClick={toogleExpand}
                />
              )
              : <></>
          }
        </Table.Cell>
        <Table.Cell active={active} textAlign="right">
          {credit}
        </Table.Cell>
        <Table.Cell active={active} textAlign="right">
          {debit}
        </Table.Cell>
      </>
    );
  }

  return (
    <>
      <Table.Row>
        <Table.Cell textAlign="center">
          <Icon name={transaction.checked ? 'lock' : 'unlock'} color={transaction.checked ? 'red' : 'green'} />
        </Table.Cell>
        <Table.Cell>{transaction.date}</Table.Cell>
        {renderOperation(currentOp, /* expanded */ false)}
        <Table.Cell textAlign="right">{currencyFormat(transaction.balance)}</Table.Cell>
        <Table.Cell textAlign="center">o</Table.Cell>
      </Table.Row>
      {
        // si il faut étendre la transaction, on rajoute autant de lignes que nécessaire
        expand
          ? transaction.operations.map((operation) => (
            <Table.Row>
              <Table.Cell colSpan="2" />
              {renderOperation(operation, /* expanded */ true)}
              <Table.Cell colSpan="2" />
            </Table.Row>
          ))
          : <></>
      }
    </>
  );
};
export default Operation;

Operation.propTypes = {
  transaction: PropTypes.shape({
    pk: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    invoice: PropTypes.string,
    balance: PropTypes.number.isRequired,
    currentOpId: PropTypes.number.isRequired,
    operations: PropTypes.arrayOf(PropTypes.shape({
      pk: PropTypes.number.isRequired,
      credit: PropTypes.number.isRequired,
      debit: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      account: PropTypes.number.isRequired,
      accountFullName: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
};
