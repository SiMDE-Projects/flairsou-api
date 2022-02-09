import React from 'react';
import PropTypes from 'prop-types';
import { Table, Icon } from 'semantic-ui-react';

import currencyFormat from '../../../../utils/currencyFormat';

const Operation = ({ transaction }) => {
  // récupération de l'objet correspondant à l'opération à afficher
  const currentOp = transaction.operations[transaction.currentOpId];

  // récupération du nom de l'autre compte (s'il n'y en a qu'un)
  let otherAccountName = '';
  if (transaction.operations.length === 2) {
    const otherOpId = (transaction.currentOpId + 1) % 2;
    otherAccountName = transaction.operations[otherOpId].accountFullName;
  } else {
    otherAccountName = 'Transaction répartie';
  }

  // récupération de l'opération liée au compte
  return (
    <Table.Row>
      <Table.Cell textAlign="center">
        <Icon name={transaction.checked ? 'lock' : 'unlock'} color={transaction.checked ? 'red' : 'green'} />
      </Table.Cell>
      <Table.Cell>{transaction.date}</Table.Cell>
      <Table.Cell>{currentOp.label}</Table.Cell>
      <Table.Cell>{otherAccountName}</Table.Cell>
      <Table.Cell textAlign="right">{currentOp.credit > 0 ? currencyFormat(currentOp.credit) : ''}</Table.Cell>
      <Table.Cell textAlign="right">{currentOp.debit > 0 ? currencyFormat(currentOp.debit) : ''}</Table.Cell>
      <Table.Cell textAlign="right">{currencyFormat(transaction.balance)}</Table.Cell>
      <Table.Cell textAlign="center">o</Table.Cell>
    </Table.Row>
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
