import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Operation from '../../atoms/Operation/Operation';

const TransactionList = ({ accountID }) => {
  const [operationList, setOperationList] = useState([]);

  useEffect(() => {
    fetch(`/api/accounts/${accountID}/operations/`)
      .then((response) => response.json())
      .then((response) => {
        setOperationList(response.operation_set);
      });
  }, [accountID]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Justificatif</th>
            <th>Compte</th>
            <th>Rapproché</th>
            <th>Dépense</th>
            <th>Recette</th>
            <th>Solde</th>
          </tr>
        </thead>
        <tbody>
          {
                operationList.map((operation) => (
                  <Operation key={operation.pk} operation={operation} />
                ))
            }
        </tbody>
      </table>
    </div>
  );
};

TransactionList.propTypes = {
  accountID: PropTypes.number.isRequired,
};

export default TransactionList;
