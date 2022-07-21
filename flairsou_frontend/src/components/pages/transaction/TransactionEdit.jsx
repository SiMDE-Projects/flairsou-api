import React, {
  useState, useEffect, useContext, memo,
} from 'react';
import { useParams, Redirect } from 'react-router-dom';

import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';
import { AppContext } from '../../contexts/contexts';
import AbstractTransaction, { DisplayTypes } from '../../UI/atoms/Transaction/AbstractTransaction';

import { Forbidden, NotFound } from '../errors/Errors';

const TransactionEdit = () => {
  // contexte de l'application
  const appContext = useContext(AppContext);

  // récupération des paramètres de requête
  const params = useParams();

  // récupération de l'ID de la transaction en base 10
  const transactionID = parseInt(params.transactionID, 10);

  // objet transaction à afficher
  const [transactionObject, setTransactionObject] = useState({ pk: 0 });

  useEffect(() => {
    if (transactionObject.pk === transactionID) {
      // pas de modification de l'objet à afficher
      return;
    }

    // réinitialisation de la transaction quand il y a un changement
    setTransactionObject({ pk: 0 });

    // récupération de l'objet transaction
    fetch(`${process.env.BASE_URL}api/transactions/${transactionID}/`)
      .then((response) => {
        if (response.status === 200) {
        // accès autorisé
          response.json().then((resp) => {
            setTransactionObject({ ...resp, balance: 0 });
          });
        } else {
          setTransactionObject({ pk: -1 });
        }
      });
  }, [transactionID, transactionObject.pk]);

  // Si le numéro de transaction n'est pas un nombre
  if (Number.isNaN(transactionID)) {
    return <NotFound />;
  }

  // l'accès à la transaction n'est pas autorisé
  if (transactionObject.pk === -1) {
    return <Forbidden />;
  }

  // la transaction n'est pas encore récupérée
  if (transactionObject.pk === 0) {
    return <></>;
  }

  /*
  if (appContext.assoActive === null) {
    // si pas d'association active, renvoie à l'accueil (on a besoin de connaître
    // l'asso active pour avoir la liste des comptes)
    return <Redirect to={{ pathname: '/' }} />;
  }
  */

  return (
    <ContentWrapper content={(
      <AbstractTransaction
        initialTransaction={transactionObject}
        readOnly={false}
        displayType={DisplayTypes.details}
        transactionCreatedCallback={(response) => setTransactionObject(response)}
        transactionUpdatedCallback={(response) => setTransactionObject(response)}
      />
    )}
    />
  );
};

export default memo(TransactionEdit);
