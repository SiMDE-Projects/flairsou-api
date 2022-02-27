import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Table, Icon, Popup, Loader,
} from 'semantic-ui-react';

import Transaction from '../../atoms/Transaction/Transaction';
import AccountTypes from '../../../../assets/accountTypeMapping';
import { compareTransactions, findTransactionIndex } from '../../../../utils/transaction_utils';

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

  // TODO voir si ça peut pas se remplacer par une boucle normale plutôt qu'un map
  // pour les questions de performances
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

  /*
   * Transaction vide pour le compte actuel
   */
  const emptyTransaction = {
    pk: 0,
    date: new Date().toISOString().split('T')[0], // yyyy-mm-dd à factoriser
    is_reconciliated: false,
    checked: false,
    invoice: null,
    balance: 0,
    activeOpId: 0, // l'opération active est toujours la première
    operations: [
      { // opération 1 : opération associée au compte actuel
        pk: 0,
        credit: 0,
        debit: 0,
        label: '',
        account: accountID,
        accountFullName: '', // TODO récupérer l'objet complet du compte plutôt que juste l'ID
      },
      {
        pk: 0,
        credit: 0,
        debit: 0,
        label: '',
        account: 0,
        accountFullName: '',
      },
    ],
  };

  // liste des transactions stockées dans l'état du composant
  const [transactionList, setTransactionList] = useState([]);

  // clé artificielle pour forcer la remise à zéro de la nouvelle transaction après
  // validation.
  const [newTransactionVal, setNewTransactionVal] = useState(0);

  // indique si les transactions sont en cours de chargement
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // on indique le chargement en cours
    setLoading(true);

    // récupération de la liste des transactions
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

    // si la liste était en cours de chargemet, suite à la mise à jour de la liste des
    // transactions non vide, le chargement est terminé
    if (loading) setLoading(false);

    // on ne remet pas à jour si l'état de chargement change (suppression du warning)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
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

  /**
   * Met à jour la transaction envoyée
   *
   * Envoie la demande de mise à jour de la transaction sur l'API
   *
   * @params {object} transaction - Transaction à mettre à jour
   */
  const updateTransaction = (transaction) => {
    fetch(`/api/transactions/${transaction.pk}/`,
      {
        method: 'PUT',
        // construction de l'objet transaction à envoyer à l'API
        body: JSON.stringify({
          pk: transaction.pk,
          date: transaction.date,
          checked: transaction.checked,
          invoice: null,
          operations: transaction.operations.map((operation) => ({
            pk: operation.pk,
            credit: operation.credit,
            debit: operation.debit,
            label: operation.label,
            account: operation.account,
          })),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (response.status === 200) {
          response.json().then((updatedTransaction) => {
            // on construit une nouvelle liste de transactions avec la mise à jour
            // de la transaction récupérée
            const newTransactionList = transactionList.map((tmpTransaction) => {
              if (tmpTransaction.pk === updatedTransaction.pk) {
                // renvoi de la nouvelle transaction mise à jour par l'API
                return ({
                  ...updatedTransaction,
                  activeOpId: getActiveOpID(updatedTransaction, accountID),
                  balance: 0, // solde à recalculer par la suite
                });
              }
              return (tmpTransaction);
            });

            // tri des transactions par date
            newTransactionList.sort(compareTransactions);

            // recherche de la transaction mise à jour
            const trIndex = findTransactionIndex(newTransactionList, updatedTransaction);

            setTransactionList(recomputeBalances(newTransactionList, invert, trIndex));
          });
        } else {
          console.log('error');
        }
      });
  };

  /**
   * Crée une nouvelle transaction
   *
   * Envoie la demande de création de la transaction sur l'API
   *
   * @params {object} transaction - Transaction à créer
   */
  const createTransaction = (transaction) => {
    fetch('/api/transactions/',
      {
        method: 'POST',
        // construction de l'objet transaction à envoyer à l'API
        body: JSON.stringify({
          date: transaction.date,
          checked: transaction.checked,
          invoice: null,
          operations: transaction.operations.map((operation) => ({
            credit: operation.credit,
            debit: operation.debit,
            label: operation.label,
            account: operation.account,
          })),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (response.status === 201) { // 201 created
          response.json().then((createdTransaction) => {
            // on ajoute la nouvelle transaction à la liste des transactions affichées
            const newTransactionList = [...transactionList, {
              ...createdTransaction,
              activeOpId: getActiveOpID(createdTransaction, accountID),
              balance: 0,
            }];

            // tri de la liste des transactions par date
            newTransactionList.sort(compareTransactions);

            // récupération de l'indice de la nouvelle transaction
            const trIndex = findTransactionIndex(newTransactionList, createdTransaction);

            // on met à jour l'état
            setTransactionList(
              recomputeBalances(newTransactionList, invert, trIndex),
            );

            setNewTransactionVal(newTransactionVal + 1);
          });
        } else {
          console.log('error');
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
          loading
            ? (
              <Table.Row>
                <Table.Cell colSpan="10">
                  <Loader active inline="centered" content="Chargement des transactions..." />
                </Table.Cell>
              </Table.Row>
            )
            : transactionList.map((transaction) => (
              <Transaction
                key={transaction.operations[transaction.activeOpId].pk}
                transaction={transaction}
                deleteCallback={deleteTransaction}
                updateCallback={updateTransaction}
                createCallback={createTransaction}
              />
            ))
        }
        <Transaction
          key={`new-transaction-${newTransactionVal}`}
          transaction={emptyTransaction}
          deleteCallback={deleteTransaction}
          updateCallback={updateTransaction}
          createCallback={createTransaction}
        />
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
