/**
 * Fonction de recherche d'un compte dans l'arbre donné.
 *
 * L'arbre donné correspond à une liste de comptes, chaque compte de la liste
 * pouvant contenir des sous-comptes. La recherche se fait sur la clé primaire
 * du compte.
 *
 * @param {Object[]} accountTree - liste de comptes dans laquelle effecter la recherche
 * @param {number} accountPk - clé primaire du compte recherché
 * @return {Object} account - compte trouvé
 */
const findAccount = (accountTree, accountPk) => {
  // parcours de tous les éléments du tableau
  for (let i = 0; i < accountTree.length; i += 1) {
    // on vérifie si le compte correspond
    if (accountTree[i].pk === accountPk) {
      return accountTree[i];
    }

    // sinon, on relance la recherche dans les sous-comptes
    const subAccount = findAccount(accountTree[i].account_set, accountPk);
    if (subAccount.pk !== -1) {
      return subAccount;
    }
  }

  // si rien n'a été trouvé, on renvoie un objet avec une clé primaire -1
  return { pk: -1 };
};

export { findAccount };
