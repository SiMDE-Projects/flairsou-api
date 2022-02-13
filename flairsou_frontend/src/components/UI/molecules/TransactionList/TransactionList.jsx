import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon } from 'semantic-ui-react';

import Transaction from '../../atoms/Transaction/Transaction';

import AccountTypes from '../../../../assets/accountTypeMapping';

const TransactionList = ({ accountID, accountType }) => {
  /*
   * accountID : ID du compte dans la base de données Flairsou
   * accountType : type du compte (voir assets/accountTypeMapping.js)
   */

  /*
   * Le calcul du solde se fait par défaut avec credit - debit, mais
   * selon le type du compte, on peut avoir besoin d'inverser ce calcul
   */
  const invert = (accountType === AccountTypes.ASSET
      || accountType === AccountTypes.EXPENSE);

  // liste des transactions stockées dans l'état du composant
  const [transactionList, setTransactionList] = useState([]);

  useEffect(() => {
    fetch(`/api/accounts/${accountID}/transactions/`)
      .then((response) => response.json())
      .then((response) => {
        // solde partiel suite aux opérations
        let balance = 0;

        // on complète la liste avec le solde partiel et l'ID de l'opération
        // associée au compte dans les opérations de la transaction
        setTransactionList(response.transaction_set.map((transaction) => {
          // recherche de l'opération associée au compte actuel
          for (let i = 0; i < transaction.operations.length; i += 1) {
            if (transaction.operations[i].account === accountID) {
              // l'opération courante est celle-ci
              const currentOp = transaction.operations[i];

              // calcul du solde partiel suite à l'opération
              balance += (invert ? -1 : 1) * (currentOp.credit - currentOp.debit);

              // renvoi de l'objet transaction avec le solde associé et l'ID de l'opération
              return {
                ...transaction,
                balance,
                currentOpId: i,
              };
            }
          }

          // voir si il faut prévoir quelque chose ici en cas de problème
          return {};
        }));
      });
  }, [accountID, invert]);

  return (
    <Table celled striped singleLine>
      <Table.Header>
        <Table.Row textAlign="center">
          <Table.HeaderCell />
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>Description</Table.HeaderCell>
          <Table.HeaderCell>Compte</Table.HeaderCell>
          <Table.HeaderCell>{invert ? 'Dépense' : 'Recette'}</Table.HeaderCell>
          <Table.HeaderCell>{invert ? 'Recette' : 'Dépense'}</Table.HeaderCell>
          <Table.HeaderCell>Solde</Table.HeaderCell>
          <Table.HeaderCell>
            <Icon
              name="check circle"
              title="Transaction pointée ou non"
            />
          </Table.HeaderCell>
          <Table.HeaderCell>
            <Icon
              name="attach"
              title="Justificatif de transaction"
            />
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          transactionList.map((transaction) => (
            <Transaction
              key={transaction.operations[transaction.currentOpId].pk}
              transaction={transaction}
            />
          ))
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
