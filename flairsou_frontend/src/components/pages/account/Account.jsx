import React, { useState, useEffect, useContext } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';
import AccountContent from '../../UI/organisms/AccountContent/AccountContent';
import { AppContext } from '../../contexts/contexts';
import CrudActions from '../../../assets/crudActions';
import AccountForm from '../../UI/molecules/AccountForm/AccountForm';
import { Unknown, Forbidden, NotFound } from '../errors/Errors';
import { AssoTypes } from '../../../assets/assoTypeMapping';
import { findAccount } from '../../../utils/accountTreeFunctions';

const SpecificAccount = ({ action }) => {
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

    // récupère le compte depuis l'arbre des comptes du contexte
    const obj = findAccount(appContext.accountList, accountID);
    setAccountObject(obj);
  }, [appContext, accountID]);

  // Si le numéro de compte n'est pas un nombre
  if (Number.isNaN(accountID)) {
    return <NotFound />;
  }

  if (accountObject.pk === 0) {
    return <ContentWrapper content={<></>} />;
  }

  if (accountObject.pk === -1) {
    return <Forbidden />;
  }

  if (appContext.assoActive === null) {
    return <Redirect to={{ pathname: '/' }} />;
  }

  switch (action) {
    case CrudActions.READ:
      return (
        <ContentWrapper content={(
          <AccountContent
            account={accountObject}
            readOnlyAccount={appContext.assoActive.asso_type === AssoTypes.CLUB}
          />
        )}
        />
      );
    case CrudActions.UPDATE:
      return <ContentWrapper content={<AccountForm account={accountObject} />} />;
    default:
      return <Unknown />;
  }
};

const Account = ({ action }) => {
  // Si création, affichage du formulaire, sinon il faut
  // récupérer le compte avant de déclencher l'affichage
  switch (action) {
    case CrudActions.CREATE:
      return <ContentWrapper content={<AccountForm />} />;
    default:
      return <SpecificAccount action={action} />;
  }
};

Account.propTypes = {
  action: PropTypes.number.isRequired,
};
SpecificAccount.propTypes = Account.propTypes;

export default Account;
