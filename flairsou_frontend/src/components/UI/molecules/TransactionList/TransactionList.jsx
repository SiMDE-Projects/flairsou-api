import React, {
  useState, useEffect, memo,
} from 'react';
import PropTypes from 'prop-types';
import {
  Table, Icon, Popup, Loader, Button,
} from 'semantic-ui-react';

import Transaction from '../../atoms/Transaction/Transaction';
import AccountTypes from '../../../../assets/accountTypeMapping';
import { compareTransactions, findTransactionIndex } from '../../../../utils/transaction_utils';
import { findAccount } from '../../../../utils/accountTreeFunctions';
import accountNodeShape from '../../../../shapes/accountShape/accountNodeShape';

/**
 * Mise en forme de la date
 * @param {Date} date - objet date
 * @return {string} date donnée au format 'yyyy-mm-dd'
 */
const formatDate = (date) => {
  const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
  const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
  const year = `${date.getFullYear()}`;
  return `${year}-${month}-${day}`;
};

/**
 * Récupère l'indice de l'opération correspondant au compte passé en paramètre dans la
 * transaction (par rapport à la liste d'opérations de la transaction)
 *
 * @param {object} transaction - objet représentant la transaction à traiter
 * @param {object} account - compte actuel
 *
 * @return {number[]} indice de l'opération correspondant au compte (potentiellement plusieurs
 *                    opérations correspondantes si le compte est virtuel)
 */
const getActiveOpID = (transaction, account) => {
  const activeOps = [];
  if (!account.virtual) {
    // si le compte actuel n'est pas virtuel, on recherche l'opération directement
    // liée au compte actuel
    for (let i = 0; i < transaction.operations.length; i += 1) {
      if (transaction.operations[i].account === account.pk) {
        activeOps.push(i);
        return activeOps;
      }
    }
  } else {
    // on est dans un compte virtuel. Ici, l'opération active correspond à l'opération
    // reliée à un sous-compte du compte actuel. Il peut y avoir plusieurs opérations
    // actives
    for (let i = 0; i < transaction.operations.length; i += 1) {
      const acc = findAccount(account.account_set, transaction.operations[i].account);
      if (acc.pk !== -1) {
        // le compte associé à l'opération i a été trouvé dans les sous comptes du compte
        // virtuel, on ajoute l'opération à la liste des opérations actives
        activeOps.push(i);
      }
    }
  }

  return activeOps;
};

/**
 * Fonction de (re)calcul des soldes partiels dans la liste des opérations
 *
 * @param {Object[]} transactionList - liste de transactions
 * @param {boolean} invert - indique si le compte inverse ou non les calculs de solde
 * @param {number} i0 - indique à partir de où les soldes partiels doivent être calculés
 * @param {number} balanceIni - indique le solde initial avant la première transaction (utilisé
 *                              seulement si i0 == 0)
 */
const recomputeBalances = (transactionList, invert, i0 = 0, balanceIni = 0) => {
  // solde partiel
  let balance = 0;
  if (i0 > 0) {
    // si un i0 est donné, on part du solde partiel précédent
    balance = transactionList[i0 - 1].balance;
  } else {
    balance = balanceIni;
  }

  // TODO voir si ça peut pas se remplacer par une boucle normale plutôt qu'un map
  // pour les questions de performances
  return transactionList.map((transaction, i) => {
    if (i < i0) {
      return transaction;
    }

    if (transaction.activeOpId !== -1) {
      // recalcul du solde à partir de l'opération
      const { credit } = transaction.operations[transaction.activeOpId];
      const { debit } = transaction.operations[transaction.activeOpId];

      // mise à jour du solde
      balance += (invert ? -1 : 1) * (credit - debit);
    }

    return {
      ...transaction,
      balance,
    };
  });
};

/**
 * Fonction de calcul des dates limites pour l'API de récupération des transactions
 *
 * La fonction détermine les dates fromDate et toDate de façon à demander à l'API la liste
 * des transactions ayant eu lieu entre fromDate et toDate. La fonction peut prendre en
 * entrée un paramètre olderDate correspondant à la précédente date fromDate pour reculer
 * d'une période donnée par NB_MONTHS.
 *
 * Si le paramètre olderDate est null, alors la date courante est utilisée. Le paramètre
 * renvoyé toDate sera donc également null.
 *
 * @typedef {Object} DateInterval
 * @property {Date} fromDate - date de début de l'intervalle de récupération
 * @property {?Date} toDate - date de fin de l'intervalle de récupération
 *
 * @param {?Date} previousFromDate - précédente date minimale de récupération
 * @param {number} NB_MONTHS - nombre de mois à récupérer par appel à l'API
 * @returns {DateInterval} intervalle de dates pour la récupération des transactions
 */
const computeLimitDates = (previousFromDate, NB_MONTHS) => {
  let fromDate;
  let toDate = null;

  if (previousFromDate === null) {
    // si la date précédente n'a pas déjà été chargée, on charge toutes les transactions
    // depuis le nombre de mois avant la date courante. Ceci permet de charger initialement
    // les éventuelles transactions futures.
    fromDate = new Date(Date.now());
  } else {
    // on a déjà récupéré les transactions jusqu'à olderDate, on prend les autres
    // transactions qui vont jusque la veille
    toDate = previousFromDate;
    toDate.setDate(toDate.getDate() - 1);
    fromDate = new Date(toDate);
  }

  // on recule la date de début NB_MONTH en amont
  fromDate.setDate(1);
  fromDate.setMonth(fromDate.getMonth() - NB_MONTHS + 1);

  return { fromDate, toDate };
};

/**
 * Récupère les transactions supplémentaires depuis la date minimale précédente
 *
 * La fonction renvoie la Promise résultante du fetch, qui au final renvoie l'objet
 * retVal construit dans la fonction.
 *
 * @param {Object} account - compte actuel correspondant à la liste des transactions affichées
 * @param {Date} previousFromDate - date minimale de la précédente récupération de transactions
 * @param {number} NB_MONTHS - nombre de mois à récupérer par récupération de transactions
 * @returns {Promise} Promise correspondant aux callbacks sur le fetch
 */
const retrieveNewTransactions = (account, previousFromDate, NB_MONTHS) => {
  // structure de l'objet renvoyé
  const retVal = {
    moreTransactions: false,
    fromDate: null,
    transactionSet: [],
    initialBalance: 0,
  };

  // calcule les dates pour la récupération des transactions
  const { fromDate, toDate } = computeLimitDates(previousFromDate, NB_MONTHS);

  // enregistrement de la nouvelle date minimale récupérée
  retVal.fromDate = fromDate;

  // construction de l'URL de récupération des transactions
  let URL = `${process.env.BASE_URL}api/accounts/${account.pk}/transactions/`;
  URL += `?from=${formatDate(fromDate)}`;
  URL += toDate ? `&to=${formatDate(toDate)}` : '';

  // récupération de la liste des transactions
  return fetch(URL)
    .then((response) => response.json())
    .then((response) => {
      // mise à jour de l'indicateur de transactions supplémentaires
      retVal.moreTransactions = response.more_transactions;

      // enregistrement du solde initial (à la veille de la première transaction de la liste)
      retVal.initialBalance = response.initial_balance;

      if (response.transaction_set.length > 0) {
        // récupération des transactions supplémentaires
        // utilisation d'un flatMap pour pouvoir construire un nombre variable de transactions
        // en front à partir d'une transaction pour l'API. C'est utile pour les comptes virtuels
        // qui font intervenir des transferts de fonds entre eux ou des transactions réparties,
        // pour que toutes les transactions soient correctement affichées et ajustent correctement
        // le solde du compte.
        const newTransactionList = response.transaction_set.flatMap((transaction) => {
          // récupération des opérations actives pour par rapport au compte
          const activeOps = getActiveOpID(transaction, account);

          // création d'une transaction par opération active (le solde sera mis à jour par la suite)
          return activeOps.map((opId) => ({ ...transaction, balance: 0, activeOpId: opId }));
        });

        retVal.transactionSet = newTransactionList;
      }

      return retVal;
    });
};

/**
 * Cette fonction permet de charger plus de transactions dans la TransactionList
 *
 * La fonction est sortie du composant pour éviter d'être re-créée à chaque changement de
 * compte et pour éviter l'utilisation d'un useCallback qui complique les choses. Ici, la
 * fonction est fixe mais en contrepartie, elle a une signature importante parce qu'il faut
 * faire passer tous les callbacks de mise à jour des états.
 *
 * @param {Object} account - compte actuel correspondant à la liste des transactions affichées
 * @param {boolean} invert - indique si le compte inverse les crédits et les débits
 * @param {?Date} previousFromDate - date minimale de la précédente récupération de transactions
 * @param {Object[]} transactionList - liste des transactions déjà chargées
 * @param {number} NB_MONTHS - nombre de mois à récupérer par récupération de transactions
 * @param {function} setLoading - callback pour l'état loading
 * @param {function} setPreviousFromDate - callback pour l'état previousFromDate
 * @param {function} setMoreTransactions - callback pour l'état moreTransactions
 * @param {function} setTransactionList - callback pour l'état transactionList
 */
const loadMoreTransactions = (
  account, invert, previousFromDate, transactionList, NB_MONTHS,
  setLoading, setPreviousFromDate, setMoreTransactions, setTransactionList,
) => {
  // met en route le loader dans le tableau
  setLoading(true);

  // récupère les nouvelles transactions depuis la dernière date
  const prom = retrieveNewTransactions(account, previousFromDate, NB_MONTHS);

  prom.then((retVal) => {
    // quand les transactions sont reçues, arrête le loader
    setLoading(false);

    // met à jour les états en fonction du retour de la fonction
    setPreviousFromDate(retVal.fromDate);
    setMoreTransactions(retVal.moreTransactions);

    if (retVal.transactionSet.length > 0) {
      // si des nouvelles transactions ont été récupérées, recalcule les soldes et met à jour
      // la liste des transactions
      setTransactionList(
        recomputeBalances(
          retVal.transactionSet.concat(transactionList), invert, 0, retVal.initialBalance,
        ),
      );
    }
  });
};

/**
 * Composant d'affichage de la liste des transactions d'un compte
 *
 * @param {Object} X - objet paramètres du composant
 * @param {Object} X.account - compte pour lequel les transactions doivent être affichées
 * @param {boolean} X.readOnlyAccount - flag indiquant si le compte est accessible en lecture
 *                                      seule ou en écriture (pilote l'édition des champs et
 *                                      l'affichage de la transaction vide)
 * @param {function} X.updateBalanceCallback - callback pour mettre à jour le solde du compte qui
 *                                             est géré dans le composant AccountContent
 */
const TransactionList = ({
  account, readOnlyAccount, updateBalanceCallback,
}) => {
  /*
   * Le calcul du solde se fait par défaut avec credit - debit, mais
   * selon le type du compte, on peut avoir besoin d'inverser ce calcul
   */
  const invert = (account.account_type === AccountTypes.ASSET
      || account.account_type === AccountTypes.EXPENSE);

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
        account: account.pk,
        accountFullName: account.fullName,
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

  // nombre de mois à charger par défaut
  const NB_MONTHS = 3;

  // liste des transactions stockées dans l'état du composant
  const [transactionList, setTransactionList] = useState([]);

  // clé artificielle pour forcer la remise à zéro de la nouvelle transaction après
  // validation.
  const [newTransactionVal, setNewTransactionVal] = useState(0);

  // indique si les transactions sont en cours de chargement
  const [loading, setLoading] = useState(false);

  // Date de départ pour la récupération des transactions
  const [previousFromDate, setPreviousFromDate] = useState(null);

  // indique s'il reste des transactions à charger pour piloter l'affichage du bouton
  const [moreTransactions, setMoreTransactions] = useState(false);

  /**
   * useEffect initial (appelé à chaque changement de compte)
   * -> charge les transactions initiale en remettant à zéro la liste
   */
  useEffect(() => {
    setTransactionList([]);
    // charge les transactions depuis la date du jour avec une liste de transactions vides
    loadMoreTransactions(account, invert, null, [], NB_MONTHS,
      setLoading, setPreviousFromDate, setMoreTransactions, setTransactionList);
  }, [account, invert]);

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
    fetch(`${process.env.BASE_URL}api/transactions/${transactionPk}/`, { method: 'DELETE' })
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
   * @param {Object} transaction - Transaction à mettre à jour
   * @param {function} resetTransactionModifiedStatus - callback pour réinitialiser l'icône de
   *                                                    statut de la transaction (disquette orange
   *                                                    vers cadenas vert)
   */
  const updateTransaction = (transaction, resetTransactionModifiedStatus) => {
    fetch(`${process.env.BASE_URL}api/transactions/${transaction.pk}/`,
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
          // la réponse est valide, on remet à jour le flag de modification
          resetTransactionModifiedStatus();

          response.json().then((updatedTransaction) => {
            // on construit une nouvelle liste de transactions avec la mise à jour
            // de la transaction récupérée
            const newTransactionList = transactionList.map((tmpTransaction) => {
              if (tmpTransaction.pk === updatedTransaction.pk) {
                // renvoi de la nouvelle transaction mise à jour par l'API
                const activeOp = getActiveOpID(updatedTransaction, account);
                if (activeOp.length === 0) {
                  console.error('<TransactionList:updateTransaction> getActiveOpId a renvoyé une liste vide !');
                }
                return ({
                  ...updatedTransaction,
                  activeOpId: activeOp[0],
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
    fetch(`${process.env.BASE_URL}api/transactions/`,
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
            const activeOps = getActiveOpID(createdTransaction, account);
            if (activeOps.length === 0) {
              console.error('<TransactionList:createTransaction> getActiveOpId a renvoyé une liste vide !');
            }
            const newTransactionList = [...transactionList, {
              ...createdTransaction,
              activeOpId: activeOps[0],
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
          loading && (
          <Table.Row>
            <Table.Cell colSpan="10">
              <Loader active inline="centered" content="Chargement des transactions..." />
            </Table.Cell>
          </Table.Row>
          )
        }
        {
          !loading && moreTransactions
            && (
            <Table.Row>
              <Table.Cell colSpan="10">
                <Button
                  content={`Charger des transactions avant le ${previousFromDate.toLocaleDateString()}...`}
                  fluid
                  onClick={() => loadMoreTransactions(account, invert, previousFromDate,
                    transactionList, NB_MONTHS, setLoading, setPreviousFromDate,
                    setMoreTransactions, setTransactionList)}
                />
              </Table.Cell>
            </Table.Row>
            )
        }
        {
           transactionList.map((transaction) => (
             <Transaction
               key={`transaction-${transaction.pk}-${transaction.activeOpId}`}
               transaction={transaction}
               readOnlyAccount={readOnlyAccount}
               deleteCallback={deleteTransaction}
               updateCallback={updateTransaction}
               createCallback={createTransaction}
             />
           ))
        }
        { /* affichage de la nouvelle transaction seulement si ce n'est pas en lecture seule */
          !readOnlyAccount && (
          <Transaction
            key={`new-transaction-${newTransactionVal}`}
            transaction={emptyTransaction}
            readOnlyAccount={false}
            deleteCallback={deleteTransaction}
            updateCallback={updateTransaction}
            createCallback={createTransaction}
          />
          )
        }
      </Table.Body>
    </Table>
  );
};

TransactionList.propTypes = {
  account: PropTypes.shape(accountNodeShape).isRequired,
  readOnlyAccount: PropTypes.bool.isRequired,
  updateBalanceCallback: PropTypes.func.isRequired,
};

export default memo(TransactionList);
