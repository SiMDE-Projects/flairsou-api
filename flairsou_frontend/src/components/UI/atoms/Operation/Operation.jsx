import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

import currencyFormat from '../../../../utils/currencyFormat';

const Operation = ({ operation, balance }) => (
  <Table.Row>
    <Table.Cell>{operation.date}</Table.Cell>
    <Table.Cell>{operation.label}</Table.Cell>
    <Table.Cell>justif</Table.Cell>
    <Table.Cell>{operation.other_account}</Table.Cell>
    <Table.Cell>{operation.reconciliated ? 'o' : 'x'}</Table.Cell>
    <Table.Cell textAlign="right">{operation.credit > 0 ? currencyFormat(operation.credit) : ''}</Table.Cell>
    <Table.Cell textAlign="right">{operation.debit > 0 ? currencyFormat(operation.debit) : ''}</Table.Cell>
    <Table.Cell textAlign="right">{currencyFormat(balance)}</Table.Cell>
  </Table.Row>
);

export default Operation;

Operation.propTypes = {
  operation: PropTypes.shape({
    pk: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    credit: PropTypes.number.isRequired,
    debit: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    other_account: PropTypes.string.isRequired,
    reconciliated: PropTypes.bool.isRequired,
  }).isRequired,
  balance: PropTypes.number.isRequired,
};
