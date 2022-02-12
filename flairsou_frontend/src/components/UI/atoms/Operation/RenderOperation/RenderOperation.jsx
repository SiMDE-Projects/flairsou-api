import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

import currencyFormat from '../../../../../utils/currencyFormat';

const RenderOperation = ({ operation, accountName, active = false }) => {
  const credit = operation.credit > 0 ? currencyFormat(operation.credit) : '';
  const debit = operation.debit > 0 ? currencyFormat(operation.debit) : '';

  return (
    <>
      <Table.Cell active={active}>
        {operation.label}
      </Table.Cell>
      <Table.Cell active={active}>
        {accountName}
      </Table.Cell>
      <Table.Cell active={active} textAlign="right">
        {credit}
      </Table.Cell>
      <Table.Cell active={active} textAlign="right">
        {debit}
      </Table.Cell>
    </>
  );
};

RenderOperation.propTypes = {
  operation: PropTypes.shape({
    pk: PropTypes.number.isRequired,
    credit: PropTypes.number.isRequired,
    debit: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    account: PropTypes.number.isRequired,
    accountFullName: PropTypes.string.isRequired,
  }).isRequired,
  accountName: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

export default RenderOperation;
