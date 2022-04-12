/**
 * Met en forme le montant flottant donné en euros pour l'affichage
 *
 * @params {number} euros - montant à afficher en euros (flottant)
 * @returns {string} chaîne de caractère représentant le montant
 */
const currencyFormat = (euros) => (
  Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    .format(euros)
);

/**
 * Transforme la chaîne donnée en entrée en représentation d'un nombre (retire les caractères non
 * numériques, remplace les virgules par des points, conserve uniquement deux chiffres pour la
 * partie décimale)
 *
 * @params {string} value - chaîne de caractère sensée représenter un montant
 * @returns {string} chaîne corrigée
 */
const filterCurrencyInput = (value) => {
  if (value === '') return '';

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

  // renvoie la mise en forme de la valeur saisie
  return newValue;
};

/**
 * Transforme une valeur entière en centimes en une chaîne de caractères représentant
 * le montant en euro correctement formaté
 *
 * @params {int} cents - montant à traiter en centimes
 * @returns {string} chaîne de caractère formatée représentant le montant
 */
const centsToStr = (cents) => (
  currencyFormat(cents / 100)
);

/**
 * Transforme la chaîne saisie par l'utilisateur en centimes pour envoyer
 * dans l'appel API
 *
 * @params {str} strValue - chaine saisie par l'utilisateur (passée par filterCurrencyInput)
 * @params {int} valeur en centimes correspondant à la saisie utilisateur
 */
const strToCents = (strValue) => {
  if (strValue === '') return 0;

  // currencyFormat place systématiquement deux chiffres après la virgule, on peut donc
  // enlever la virgule pour obtenir directement les centimes
  const newValue = currencyFormat(strValue) // met en forme
    .replace(/\u202f/g, '') // supprime les espaces insécables
    .replace(/,/g, ''); // supprime la virgule

  // renvoie un entier parsé en base 10
  return parseInt(newValue, 10);
};

export {
  currencyFormat, filterCurrencyInput, strToCents, centsToStr,
};
