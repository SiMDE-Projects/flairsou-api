import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Popup } from 'semantic-ui-react';

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
          // recherche de l'opération active (associée au compte actuel)
          for (let i = 0; i < transaction.operations.length; i += 1) {
            if (transaction.operations[i].account === accountID) {
              // l'opération active est celle-ci
              const activeOp = transaction.operations[i];

              // calcul du solde partiel suite à l'opération
              balance += (invert ? -1 : 1) * (activeOp.credit - activeOp.debit);

              // renvoi de l'objet transaction avec le solde associé et l'ID de l'opération
              return {
                ...transaction,
                balance,
                activeOpId: i,
              };
            }
          }

          // voir si il faut prévoir quelque chose ici en cas de problème
          return {};
        }));
      });
  }, [accountID, invert]);

  /**
   * Supprime la transaction indiquée
   *
   * Envoie la demande de suppression à l'API. Si la suppression est validée, met
   * à jour la liste des transactions.
   *
   * @param {number} transactionPk - clé primaire de la transaction à supprimer
   * @returns {type}
   */
  const deleteTransaction = (transactionPk) => {
    fetch(`/api/transactions/${transactionPk}/`, { method: 'DELETE' })
      .then((response) => {
        if (response.status === 204) {
          // on veut supprimer la transaction de la liste courante
          // on construit un nouveau tableau (le spreading est nécessaire pour faire
          // une vraie copie et pas prendre une référence)
          const newTransactionList = [...transactionList];

          // 1 - on recherche l'indice de la transaction à supprimer dans transactionList
          let index = 0;
          for (let i = 0; i < newTransactionList.length; i += 1) {
            if (newTransactionList[i].pk === transactionPk) {
              index = i;
              break;
            }
          }

          // 2 - on enlève la transaction à supprimer de la liste
          newTransactionList.splice(index, 1);

          // 3 - on recalcule les soldes partiels à partir de la transaction supprimée
          // récupération du solde de la dernière transaction non modifiée
          let balance = 0;
          if (index !== 0) {
            balance = newTransactionList[index - 1].balance;
          }

          for (let i = index; i < newTransactionList.length; i += 1) {
            // récupération du crédit et du débit de l'opération active de la transaction
            const { credit } = newTransactionList[i].operations[newTransactionList[i].activeOpId];
            const { debit } = newTransactionList[i].operations[newTransactionList[i].activeOpId];

            // mise à jour du solde
            balance += (invert ? -1 : 1) * (credit - debit);
            newTransactionList[i].balance = balance;
          }

          // mise à jour de la liste des transactions
          setTransactionList(newTransactionList);
        } else {
          console.error(`Erreur de suppression de la transaction ${transactionPk}`);
        }
      });
  };

  return (
    <Table celled striped singleLine>
      <Table.Header>
        <Table.Row textAlign="center">
          <Table.HeaderCell>
            <Popup
              content="Indique si la transaction est rapprochée ou non. Une transaction rapprochée n'est pas modifiable."
              trigger={<Icon name="info circle" />}
            />
          </Table.HeaderCell>
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
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          transactionList.map((transaction) => (
            <Transaction
              key={transaction.operations[transaction.activeOpId].pk}
              transaction={transaction}
              deleteCallback={deleteTransaction}
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
