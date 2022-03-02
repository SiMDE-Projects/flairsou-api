/**
 * Fonction de comparaison des transactions
 *
 * Cette fonction permet de comparer deux transactions par rapport à leur date pour être
 * utilisée par la fonction de tri de la liste.
 */
const compareTransactions = (tr1, tr2) => {
  if (tr1.date < tr2.date) return -1;
  if (tr1.date > tr2.date) return 1;
  return 0;
};

/**
 * Fonction de recherche d'une transaction dans un tableau
 *
 * Renvoie l'indice d'une transaction particulière dans la liste de transactions
 * donnée. La recherche commence par le bas car on suppose que les transactions
 * que l'on recherche sont plus souvent récentes (nouvelles transactions et transactions
 * mises à jour).
 * TODO : optimiser ça par dichotomie sur la date en supposant que la liste des transactions est
 * triée.
 */
const findTransactionIndex = (transactionList, targetTransaction) => {
  for (let i = transactionList.length - 1; i > 0; i -= 1) {
    if (transactionList[i].pk === targetTransaction.pk) {
      return i;
    }
  }

  return -1;
};

export { compareTransactions, findTransactionIndex };
