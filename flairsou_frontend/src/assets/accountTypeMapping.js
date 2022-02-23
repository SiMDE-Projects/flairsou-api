const AccountTypes = {
  ASSET: 0,
  LIABILITY: 1,
  INCOME: 2,
  EXPENSE: 3,
  EQUITY: 4,
};
const AccountTypesString = [
  'Actif',
  'Passif',
  'Revenus',
  'Dépenses',
  'Capitaux Propres',
];
export const AccountTypesSelect = AccountTypesString.map((v, i) => ({
  key: i,
  text: v,
  value: i,
}));

export default AccountTypes;
