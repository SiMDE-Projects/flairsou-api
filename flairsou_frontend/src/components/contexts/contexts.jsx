/* eslint-disable import/prefer-default-export */

import { createContext } from 'react';

// contexte contenant les informations de l'utilisateur pour l'application
// dans son ensemble
export const AppContext = createContext({
  user: {},
  assos: [],
  assoActive: {},
  updateAssoActive: (assoId) => {}, /* eslint-disable-line no-unused-vars */
  refreshAccountList: () => {},
  accountList: [],
  accountActive: -1,
  setAccountActive: (accountPk) => {}, /* eslint-disable-line no-unused-vars */
  alert: {},
  setAlert: (alert) => {}, /* eslint-disable-line no-unused-vars */
});
