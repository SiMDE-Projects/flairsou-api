import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
} from 'semantic-ui-react';

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
    <Table celled>
      <Table.Header>
        <Table.Row textAlign="center">
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>Description</Table.HeaderCell>
          <Table.HeaderCell>Justificatif</Table.HeaderCell>
          <Table.HeaderCell>Compte</Table.HeaderCell>
          <Table.HeaderCell>Rapproché</Table.HeaderCell>
          <Table.HeaderCell>Dépense</Table.HeaderCell>
          <Table.HeaderCell>Recette</Table.HeaderCell>
          <Table.HeaderCell>Solde</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          operationList.map((operation) => (
            <Operation key={operation.pk} operation={operation} />
          ))
        }
      </Table.Body>
    </Table>
  );
};

TransactionList.propTypes = {
  accountID: PropTypes.number.isRequired,
};

export default TransactionList;
