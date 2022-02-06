import React from 'react';
import PropTypes from 'prop-types';

import './Operation.css';

const Operation = ({ operation }) => (
  <tr>
    <td>{operation.date}</td>
    <td>{operation.label}</td>
    <td>justif</td>
    <td>Compte</td>
    <td>rapp</td>
    <td className="money">{operation.credit > 0 ? (operation.credit / 100).toFixed(2) : ''}</td>
    <td className="money">{operation.debit > 0 ? (operation.debit / 100).toFixed(2) : ''}</td>
    <td>solde</td>
  </tr>
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
};
