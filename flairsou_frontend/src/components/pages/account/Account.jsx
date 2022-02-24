import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';
import AccountContent from '../../UI/organisms/AccountContent/AccountContent';

const Account = () => {
  // récupération des paramètres de requête
  const params = useParams();
  // récupération de l'ID du compte en base 10
  const accountID = parseInt(params.accountID, 10);

  const [accountObject, setAccountObject] = useState({ pk: 0 });

  useEffect(() => {
    // réinitialise l'affichage quand on change de compte
    setAccountObject({ pk: 0 });
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
  }, [accountID]);

  return (
    <ContentWrapper content={<AccountContent account={accountObject} />} />
  );
};

export default Account;
