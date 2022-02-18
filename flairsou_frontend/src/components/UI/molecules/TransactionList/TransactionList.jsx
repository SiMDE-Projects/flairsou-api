import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Popup } from 'semantic-ui-react';

import Transaction from '../../atoms/Transaction/Transaction';

import AccountTypes from '../../../../assets/accountTypeMapping';

/**
 * Récupère l'indice de l'opération correspondant au compte passé en paramètre dans la
 * transaction (par rapport à la liste d'opérations de la transaction)
 *
 * @param {object} transaction - objet représentant la transaction à traiter
 * @param {number} accountID - clé primaire du compte actuel
 *
 * @return {number} indice de l'opération correspondant au compte
 */
const getActiveOpID = (transaction, accountID) => {
  for (let i = 0; i < transaction.operations.length; i += 1) {
    if (transaction.operations[i].account === accountID) return i;
  }
  return -1;
};

/**
 * Fonction de (re)calcul des soldes partiels dans la liste des opérations
 *
 * @params {?} transactionList - liste de transactions
 * @params {bool} invert - indique si le compte inverse ou non les calculs de solde
 * @params {number} i0 - indique à partir de où les soldes partiels doivent être calculés
 */
const recomputeBalances = (transactionList, invert, i0 = 0) => {
  // solde partiel
  let balance = 0;
  if (i0 > 0) {
    // si un i0 est donné, on part du solde partiel précédent
    balance = transactionList[i0 - 1].balance;
  }

  return transactionList.map((transaction, i) => {
    if (i < i0) {
      return transaction;
    }

    // recalcul du solde à partir de l'opération
    const { credit } = transaction.operations[transaction.activeOpId];
    const { debit } = transaction.operations[transaction.activeOpId];

    // mise à jour du solde
    balance += (invert ? -1 : 1) * (credit - debit);

    return {
      ...transaction,
      balance,
    };
  });
};

const TransactionList = ({ accountID, accountType, updateBalanceCallback }) => {
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
        // récupéation des IDs des opérations actives par transaction
        const newTransactionList = response.transaction_set.map((transaction) => (
          {
            ...transaction,
            balance: 0,
            activeOpId: getActiveOpID(transaction, accountID),
          }));

        // calcul des soldes partiels depuis le début
        setTransactionList(recomputeBalances(newTransactionList, invert));
      });
  }, [accountID, invert]);

  /**
   * Mise à jour du solde global du compte
   */
  useEffect(() => {
    if (transactionList.length === 0) return;

    const lastBalance = transactionList[transactionList.length - 1].balance;

    // la valeur finale de solde correspond au solde du compte à mettre à jour
    updateBalanceCallback(lastBalance);
  }, [transactionList, updateBalanceCallback]);

  /**
   * Supprime la transaction indiquée
   *
   * Envoie la demande de suppression à l'API. Si la suppression est validée, met
   * à jour la liste des transactions.
   *
   * @param {number} transactionPk - clé primaire de la transaction à supprimer
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

          // mise à jour de la liste des transactions
          setTransactionList(recomputeBalances(newTransactionList, invert, index));
        } else {
          console.error(`Erreur de suppression de la transaction ${transactionPk}`);
        }
      });
  };

  return (
    <Table celled striped singleLine compact size="small">
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
  updateBalanceCallback: PropTypes.func.isRequired,
};

export default TransactionList;
