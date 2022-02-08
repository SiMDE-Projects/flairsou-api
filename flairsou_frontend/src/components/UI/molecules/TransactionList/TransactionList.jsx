import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
} from 'semantic-ui-react';

import Operation from '../../atoms/Operation/Operation';

import AccountTypes from '../../../../assets/accountTypeMapping';

const TransactionList = ({ accountID, accountType }) => {
  /*
   * accountID : ID du compte dans la base de données Flairsou
   * accountType : type du compte (voir assets/accountTypeMapping.js)
   */
  const [operationList, setOperationList] = useState([]);

  useEffect(() => {
    fetch(`/api/accounts/${accountID}/operations/`)
      .then((response) => response.json())
      .then((response) => {
        setOperationList(response.operation_set);
      });
  }, [accountID]);

  /*
   * Le calcul du solde se fait par défaut avec credit - debit, mais
   * selon le type du compte, on peut avoir besoin d'inverser ce calcul
   */
  const invert = (accountType === AccountTypes.ASSET
      || accountType === AccountTypes.EXPENSE);

  // solde flottant qui évolue à chaque opération ajoutée à la liste
  let solde = 0;

  return (
    <Table celled>
      <Table.Header>
        <Table.Row textAlign="center">
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>Description</Table.HeaderCell>
          <Table.HeaderCell>Justificatif</Table.HeaderCell>
          <Table.HeaderCell>Compte</Table.HeaderCell>
          <Table.HeaderCell>Rapproché</Table.HeaderCell>
          <Table.HeaderCell>{invert ? 'Dépense' : 'Recette'}</Table.HeaderCell>
          <Table.HeaderCell>{invert ? 'Recette' : 'Dépense'}</Table.HeaderCell>
          <Table.HeaderCell>Solde</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          operationList.map((operation) => {
            // mise à jour du solde suite à l'opération courante
            solde += (invert ? -1 : 1) * (operation.credit - operation.debit);
            // construction du composant correspondant
            return (
              <Operation key={operation.pk} operation={operation} balance={solde} />
            );
          })
        }
      </Table.Body>
    </Table>
  );
};

TransactionList.propTypes = {
  accountID: PropTypes.number.isRequired,
  accountType: PropTypes.number.isRequired,
};

export default TransactionList;
