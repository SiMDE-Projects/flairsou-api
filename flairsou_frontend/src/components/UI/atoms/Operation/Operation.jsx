import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

const Operation = ({ operation, balance }) => (
  <Table.Row>
    <Table.Cell>{operation.date}</Table.Cell>
    <Table.Cell>{operation.label}</Table.Cell>
    <Table.Cell>justif</Table.Cell>
    <Table.Cell>Compte</Table.Cell>
    <Table.Cell>rapp</Table.Cell>
    <Table.Cell textAlign="right">{operation.credit > 0 ? (operation.credit / 100).toFixed(2) : ''}</Table.Cell>
    <Table.Cell textAlign="right">{operation.debit > 0 ? (operation.debit / 100).toFixed(2) : ''}</Table.Cell>
    <Table.Cell textAlign="right">{(balance / 100).toFixed(2)}</Table.Cell>
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
  }).isRequired,
  balance: PropTypes.number.isRequired,
};
