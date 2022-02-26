/**
 * Ajoute les séparateurs de milliers dans la chaîne de caractères représentant
 * le montant
 *
 * @params {string} strValue - chaîne de caractères représentant le montant à mettre en forme
 * @returns {string} chaîne de caractère modifiée
 */
const addThousandsSeparator = (strValue) => (
  strValue.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
);

/**
 * Met en forme les montants donnés en centimes pour les transformer
 * en euros et ajouter une espace comme séparateur de milliers
 *
 * @params {int} cents - montant à afficher en centimes
 * @returns {string} chaîne de caractère représentant le montant
 */
const currencyFormat = (cents) => (
  addThousandsSeparator((cents / 100).toFixed(2))
);

/**
 * Transforme la chaîne donnée en entrée en représentation d'un nombre (retire les caractères non
 * numériques, remplace les virgules par des points, conserve uniquement deux chiffres pour la
 * partie décimale)
 *
 * @params {string} value - chaîne de caractère sensée représenter un montant
 * @returns {string} chaîne corrigée
 */
const checkCurrencyFormat = (value) => {
  // retire tous les caractères qui ne sont pas des chiffres ou un point ou une virgule
  let newValue = value.replace(/[^\d.,]/g, '');

  // remplace les virgules par des points
  newValue = newValue.replace(/,/g, '.');

  // si il y a au moins un point dans la valeur, on garde uniquement deux chiffres
  // après le premier
  if (newValue.indexOf('.') !== -1) {
    // on conserve uniquement deux caractères après le premier point, et on enlève tout
    // après un éventuel point dans les deux caractères qui suivent
    newValue = newValue.replace(/^(\d*\.\d?\d?).*$/g, '$1');
  }

  return newValue;
};

const strToCents = (strValue) => {
  if (strValue === '') return 0;

  // supprime les espaces utilisés comme séparateurs de milliers
  const newValue = strValue.replace(/ /g, '');

  // force le renvoi d'un entier
  return Math.floor(parseFloat(newValue) * 100);
};

export { currencyFormat, checkCurrencyFormat, strToCents };
