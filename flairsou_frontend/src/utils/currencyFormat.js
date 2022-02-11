/*
 * met en forme les montants donnés en centimes pour les transformer
 * en euros et ajouter le séparateur de milliers
 */
const currencyFormat = (cents) => (
  (cents / 100).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
);

export default currencyFormat;
