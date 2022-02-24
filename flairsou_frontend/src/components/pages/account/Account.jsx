import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';
import AccountContent from '../../UI/organisms/AccountContent/AccountContent';
import { AppContext } from '../../contexts/contexts';

const Account = () => {
  // contexte de l'application
  const appContext = useContext(AppContext);

  // récupération des paramètres de requête
  const params = useParams();
  // récupération de l'ID du compte en base 10
  const accountID = parseInt(params.accountID, 10);

  const [accountObject, setAccountObject] = useState({ pk: 0 });

  useEffect(() => {
    if (appContext.accountActive === accountID) {
      // pas de modification si le compte actif ne change pas
      return;
    }

    // réinitialise l'affichage quand on change de compte
    setAccountObject({ pk: 0 });

    // met à jour le contexte
    appContext.setAccountActive(accountID);

    // récupère l'objet compte associé
    fetch(`/api/accounts/${accountID}/`)
      .then((response) => {
        if (response.status === 200) {
          /* si la réponse est valide, l'accès est autorisé, on stocke la
           * réponse de l'API */
          response.json().then((resp) => {
            setAccountObject(resp);
          });
        } else {
          setAccountObject({ pk: -1 });
        }
      });
  }, [appContext, accountID]);

  if (accountObject.pk === 0) {
    return (
      <ContentWrapper content={<></>} />
    );
  }

  if (accountObject.pk === -1) {
    return (
      <ContentWrapper content={<h1>Forbidden</h1>} />
    );
  }

  return (
    <ContentWrapper content={<AccountContent account={accountObject} />} />
  );
};

export default Account;
