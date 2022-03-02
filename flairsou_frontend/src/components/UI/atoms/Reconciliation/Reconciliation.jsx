import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Button, Input,
} from 'semantic-ui-react';
import './reconciliation.css';
/**
 * Composant permettant d'effectuer un rapprochement
 */
const Reconciliation = ({ accountID, accountFullName }) => {
  /*
   * accountID : ID du compte dans la base de données Flairsou
   * accountFullName : Nom complet du compte
   */
  const [open, setOpen] = React.useState(false);

  const [reconciliationObject, setReconciliationObject] = useState([]);

  useEffect(() => {
    fetch(`${process.env.BASE_URL}api/accounts/${accountID}/reconciliation/`)
      .then((response) => {
        if (response.status === 200) {
          /* si la réponse est valide, l'accès est autorisé, on stocke la
           * réponse de l'API */
          response.json().then((resp) => {
            setReconciliationObject(resp);
          });
        } else {
          setReconciliationObject({ pk: -1 });
        }
      });
  }, [accountID]);

  const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  const getLastTime = () => (
    reconciliationObject.date == null ? '1994-01-01' : reconciliationObject.date
  );

  const [reconciliationDate, setDate] = useState(today);
  const [reconciliationBalance, setBalance] = useState('');

  const [error, setError] = useState('');
  const [errorDate, setErrorDate] = useState(false);
  const [errorBalance, setErrorBalance] = useState(false);

  function changeBalance(value) {
    setBalance(value * 100);
    setError('');
    setErrorBalance(false);
    setErrorDate(false);
  }

  function changeDate(value) {
    setDate(value);
    setError('');
    setErrorBalance(false);
    setErrorDate(false);
  }

  function validateReconciliation() {
    // on vérifie que les champs du formulaire ont été remplis
    if (!reconciliationDate || (!reconciliationBalance && reconciliationBalance !== 0)) {
      setError('Merci de remplir tous les champs avant de valider !');
      setErrorDate(true);
      setErrorBalance(true);
      return false;
    }

    // on vérifie que la date demandée est cohérente
    if ((reconciliationDate > today) || (reconciliationDate <= getLastTime)) {
      setError('Impossible d\'effectuer un rapprochement avant le dernier rapprochement ou après la date du jour');
      setErrorDate(true);
      return false;
    }

    // récupération du solde à la date demandée
    fetch(`${process.env.BASE_URL}api/accounts/${accountID}/balance/?date=${reconciliationDate}`)
      .then((response) => {
        if (response.status === 200) {
          /* si la réponse est valide */
          response.json().then((resp) => {
            const solde = resp.balance;

            // on vérifie que le solde indiqué correspond bien à ce qui est en mémoire
            if (reconciliationBalance !== solde) {
              setError(`Le solde ne correspond pas. Solde trouvé : ${solde / 100} €`);
              setErrorBalance(true);
              return false;
            }

            // request data
            const data = {
              account: accountID,
              date: reconciliationDate,
              balance: reconciliationBalance,
            };

            // request options
            const options = {
              method: 'POST',
              body: JSON.stringify(data),
              headers: {
                'Content-Type': 'application/json',
              },
            };
            fetch(`${process.env.BASE_URL}api/accounts/${accountID}/reconciliation/`, options)
              .then((res) => {
                res.json();
                window.location.reload();
                setOpen(false);
              });
            return true;
          });
        } else {
          setError('Impossible de récupérer le solde sur le serveur');
        }
      });
    return true;
  }

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button>Rapprochement</Button>}
    >
      <Modal.Header>
        Rapprochement du compte
        {' '}
        {accountFullName}
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <b className="error">
            {error}
          </b>
          <p>
            {reconciliationObject.date === null ? 'Aucun précédent rapprochement sur ce compte'
              : `Date du dernier rapprochement : ${reconciliationObject.date}`}
          </p>
          <p>
            Date :
            {' '}
            <Input error={errorDate} defaultValue={today} type="date" min={getLastTime} max={today} onChange={(event) => changeDate(event.target.value)} />
          </p>
          <p>
            Montant :
            {' '}
            <Input error={errorBalance} placeholder="0,00" type="number" min="0" step="0.01" onChange={(event) => changeBalance(event.target.value)} />
          </p>
          <i className="warning">
            &#9888; Tout rapprochement est définitif et non modifiable
          </i>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Annuler"
          onClick={() => setOpen(false)}
        />
        <Button
          content="Valider"
          labelPosition="right"
          icon="checkmark"
          onClick={() => validateReconciliation()}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
};

Reconciliation.propTypes = {
  accountID: PropTypes.number.isRequired,
  accountFullName: PropTypes.string.isRequired,
};

export default memo(Reconciliation);
