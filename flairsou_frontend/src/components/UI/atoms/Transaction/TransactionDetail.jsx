import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { InputFile } from 'semantic-ui-react-input-file';
import {
  Container,
  Header,
  Divider,
  Table,
  Button,
  Icon,
  Popup,
  Input,
  Checkbox,
} from 'semantic-ui-react';
import ConfirmDeleteObject from '../ConfirmDeleteObject/ConfirmDeleteObject';

import Operation, { NO_ACCOUNT } from './Operation/Operation';

/**
 * Forme des objets Operation utilisés dans le composant TransactionForm
 */
const emptyOperation = {
  pk: 0,
  credit: 0,
  debit: 0,
  label: '',
  account: NO_ACCOUNT, // par défaut, pas de compte associé
  accountFullName: '',
};

/**
 * Fonction qui vérifie si l'opération passée en paramètre est vide
 */
const isOperationEmpty = (op) => (op.credit === 0
  && op.debit === 0 && op.label === '' && op.account === NO_ACCOUNT);

/**
 * Fonction qui vérifie si l'opération passée en paramètre possède une clé locale
 */
const hasLocalKey = (op) => Object.prototype.hasOwnProperty.call(op, 'localKey');

/**
 * TODO
 */
const TransactionDetail = ({
  transaction, modified, readOnly, callbacks,
}) => {
  /**
   * Quand la transaction est mise à jour dans le composant parent, on met à jour les opérations
   * pour y ajouter si nécessaire une clé locale utilisée pour la gestion des affichages
   * dans ce composant.
   */
  useEffect(() => {
    let keyAdded = false;

    const newOps = transaction.operations.map((op) => {
      // on ajoute la clé si elle n'existe pas
      if (!hasLocalKey(op)) {
        keyAdded = true;
        return { ...op, localKey: uuidv4() };
      }
      return op;
    });

    if (keyAdded) {
      // mise à jour des opérations seulement si une clé a été ajoutée, pour éviter
      // les boucles infinies de mise à jour
      callbacks.updateOperations(newOps);
    }
  }, [transaction, callbacks]);

  /**
   * Ajoute une nouvelle opération vide à la liste des opérations. Cet ajout se fait seulement si
   * toutes les opérations de la transaction sont au moins partiellement remplies.
   */
  const addNewOperation = () => {
    let oneOpEmpty = false;
    transaction.operations.forEach((operation) => {
      // si l'opération est vide, le flag oneOpEmpty passe à true
      oneOpEmpty = oneOpEmpty || isOperationEmpty(operation);
    });

    if (oneOpEmpty === false) {
      // toutes les opérations sont remplies, on ajoute une nouvelle opération vide
      // à laquelle on associe une nouvelle clé locale
      callbacks.updateOperations(
        [...transaction.operations, { ...emptyOperation, localKey: uuidv4() }],
      );
    }
  };

  /**
   * Supprime une ligne d'opération dans le tableau
   */
  const deleteOperation = (opLocalKey) => {
    // on supprime l'opération qui correspond à la clé locale fournie
    const newOps = transaction.operations.filter((op) => op.localKey !== opLocalKey);

    // on met à jour les opérations
    callbacks.updateOperations(newOps);
  };

  const [invoiceFormDisplay, setInvoiceFormDisplay] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentNote, setCurrentNote] = useState('');

  const sendNewInvoice = () => {
    // API de création des pièces-jointes
    const URL = `${process.env.BASE_URL}api/attachments/`;

    // données de la requête
    const formData = new FormData();
    formData.append('document', currentFile);
    formData.append('transaction', transaction.pk);
    formData.append('notes', currentNote);

    // envoi de la requête
    fetch(URL, {
      method: 'POST',
      body: formData,
    }).then((response) => {
      if (response.status !== 201) {
        console.error('Erreur de création de la pièce-jointe');
        console.error(response);
      } else {
        // ajout de la PJ réussi
        response.json().then((newInvoice) => {
          const newInvoices = [...transaction.invoices, newInvoice];
          callbacks.updateInvoices(newInvoices);
          setInvoiceFormDisplay(false);
          setCurrentFile(null);
          setCurrentNote('');
        });
      }
    });
  };

  /**
   * Fonction de suppression d'un justificatif.
   *
   * Attention, cette fonction supprime le justificatif sans demander de confirmation.
   * La confirmation doit être demandée au préalable.
   */
  const deleteInvoice = (invoiceId) => {
    // vérifie que le justificatif demandé est bien dans la liste de la transaction
    // courante
    const invoice = transaction.invoices.find((inv) => inv.pk === invoiceId);

    if (invoice === undefined) {
      console.error('Erreur de récupération du justificatif à supprimer');
      return;
    }

    const URL = `${process.env.BASE_URL}api/attachments/${invoice.pk}/`;

    fetch(URL, { method: 'DELETE' })
      .then((response) => {
        if (response.status !== 204) {
          console.error('Erreur de suppression du justificatif');
          return;
        }

        // met à jour les justificatifs en gardant uniquement ceux qui n'ont pas été
        // supprimés
        const newInvoices = transaction.invoices.filter((inv) => inv.pk !== invoice.pk);
        callbacks.updateInvoices(
          newInvoices,
        );
      });
  };

  // pas de rendu tant que les clés locales n'ont pas été ajoutées
  for (let i = 0; i < transaction.operations.length; i += 1) {
    if (!hasLocalKey(transaction.operations[i])) {
      return (<></>);
    }
  }

  return (
    <Container>
      <Header as="h1">
        Détails de la transaction
      </Header>

      <Table definition collapsing>
        <Table.Body>
          <Table.Row>
            <Table.Cell content="Date" />
            <Table.Cell textAlign="center" collapsing>
              {readOnly
                ? new Date(transaction.date).toLocaleDateString()
                : (
                  <Input
                    type="date"
                    transparent
                    defaultValue={transaction.date}
                    onChange={callbacks.updateDate}
                  />
                )}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell content="Transaction pointée" />
            <Table.Cell textAlign="center">
              <Checkbox
                checked={transaction.checked}
                disabled={readOnly}
                onChange={(event, data) => callbacks.updateCheck(data.checked)}
              />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell content="Transaction rapprochée" />
            <Table.Cell textAlign="center" content={transaction.is_reconciliated ? 'Oui' : 'Non'} />
          </Table.Row>
        </Table.Body>
      </Table>

      <Divider />
      <Header as="h2">
        Liste des opérations
      </Header>

      <p>
        La transaction doit avoir
        {' '}
        <b>au moins deux opérations</b>
        . Les crédits et les débits doivent être équilibrés.
      </p>

      <Table celled>
        <Table.Header>
          <Table.Row textAlign="center">
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell>Compte</Table.HeaderCell>
            <Table.HeaderCell>
              Crédit
              {' '}
              <Popup
                content={(
                  <p>
                    Un crédit
                    {' '}
                    <b>augmente</b>
                    {' '}
                    le solde d&apos;un compte de passifs et de recettes et
                    {' '}
                    <b>diminue</b>
                    {' '}
                    le solde d&apos;un compte d&apos;actifs et de dépenses.
                  </p>
              )}
                trigger={<Icon name="info circle" />}
              />
            </Table.HeaderCell>
            <Table.HeaderCell>
              Débit
              {' '}
              <Popup
                content={(
                  <p>
                    Un débit
                    {' '}
                    <b>augmente</b>
                    {' '}
                    le solde d&apos;un compte d&apos;actifs et de dépenses et
                    {' '}
                    <b>diminue</b>
                    {' '}
                    le solde d&apos;un compte de passifs et de recettes.
                  </p>
              )}
                trigger={<Icon name="info circle" />}
              />
            </Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {transaction.operations.map((operation, i) => (
            <Table.Row key={`op-tr-details-${operation.localKey}`}>
              <Operation
                initialOp={operation}
                clickToExpand={null}
                active={false}
                readOnly={readOnly || transaction.is_reconciliated}
                updateCallback={(updatedOp) => {
                  // mise à jour de l'opération i dans le tableau
                  callbacks.updateOperation(updatedOp, i);
                }}
                operationValidatedCallback={callbacks.validateTransaction}
              />
              <Table.Cell
                textAlign="center"
                content={(
                  <Icon
                    link
                    name="delete"
                    color="red"
                    onClick={() => deleteOperation(operation.localKey)}
                  />
                )}
              />
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Button
        color="blue"
        icon
        labelPosition="left"
        onClick={() => addNewOperation()}
      >
        <Icon name="add" />
        Ajouter une opération
      </Button>

      <Button
        color={modified ? 'green' : 'grey'}
        icon
        labelPosition="left"
        onClick={callbacks.validateTransaction}
      >
        <Icon name="save" />
        Enregistrer
      </Button>

      <Button
        color={modified ? 'brown' : 'grey'}
        icon
        labelPosition="left"
        onClick={callbacks.reinitializeTransaction}
      >
        <Icon name="undo" />
        Réinitialiser
      </Button>

      <Divider />
      <Header as="h2">
        Justificatifs
      </Header>

      {transaction.invoices.length > 0
        ? (
          <Table celled>
            <Table.Header>
              <Table.Row textAlign="center">
                <Table.HeaderCell>Document</Table.HeaderCell>
                <Table.HeaderCell>Nom du fichier</Table.HeaderCell>
                <Table.HeaderCell>Notes</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {transaction.invoices.map((invoice) => (
                <Table.Row key={`op-tr-invoice-${invoice.pk}`}>
                  <Table.Cell
                    textAlign="center"
                    content={(
                      <a href={invoice.document}>
                        <Icon
                          link
                          name="file pdf"
                        />
                      </a>
                    )}
                    collapsing
                  />
                  <Table.Cell
                    textAlign="center"
                    collapsing
                    content={invoice.document.split('/').pop()}
                  />
                  <Table.Cell
                    textAlign="left"
                    content={invoice.notes}
                  />
                  <Table.Cell
                    textAlign="center"
                    collapsing
                    content={(
                      <ConfirmDeleteObject
                        objectName="justificatif"
                        objectDetail={invoice.document.split('/').pop()}
                        onConfirm={() => deleteInvoice(invoice.pk)}
                      />
                    )}
                  />
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )
        : <p>Aucun justificatif pour cette transaction !</p>}

      {invoiceFormDisplay
        ? (
          <>
            <p>Nouveau justificatif</p>
            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.Cell
                    collapsing
                    content="Fichier à joindre"
                  />
                  <Table.Cell>
                    <InputFile
                      input={{
                        id: 'invoice_input_file',
                        onChange: (event) => { setCurrentFile(event.target.files[0]); },
                      }}
                    />
                    {currentFile ? currentFile.name : ''}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell collapsing content="Notes" />
                  <Table.Cell>
                    <Input
                      value={currentNote}
                      onChange={(event) => { setCurrentNote(event.target.value); }}
                      fluid
                      transparent
                    />
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
            <Button
              color="green"
              icon
              labelPosition="left"
              onClick={() => sendNewInvoice()}
            >
              <Icon name="check" />
              Valider
            </Button>
            <Button color="red" icon labelPosition="left" onClick={() => setInvoiceFormDisplay(false)}>
              <Icon name="cancel" />
              Annuler
            </Button>
          </>
        )
        : (
          <Button color="blue" icon labelPosition="left" onClick={() => setInvoiceFormDisplay(true)}>
            <Icon name="add" />
            Ajouter un justificatif
          </Button>
        )}
    </Container>
  );
};

/**
 * TODO
 */
TransactionDetail.propTypes = {
  /** objet transaction à afficher */
  transaction: PropTypes.shape({
    // clé primaire de la transaction dans la base de l'API
    pk: PropTypes.number.isRequired,
    // date de la transaction
    date: PropTypes.string.isRequired,
    // indique si la transaction est rapprochée ou non. Une transaction rapprochée passe
    // en lecture seule
    is_reconciliated: PropTypes.bool.isRequired,
    // indique si la transaction est pointée ou non (quand une transaction saisie
    // et constatée sur le compte en ligne, l'utilisateur peut la pointer pour indiquer
    // qu'elle est correctement saisie)
    checked: PropTypes.bool.isRequired,
    // justificatifs associés à la transaction
    invoices: PropTypes.arrayOf(PropTypes.shape({
      // clé primaire du justificatif
      pk: PropTypes.number.isRequired,
      // URL vers le document à télécharger
      document: PropTypes.string.isRequired,
      // ID de la transaction courante
      transaction: PropTypes.number.isRequired,
      // notes éventuelles sur le document attaché
      notes: PropTypes.string,
    })).isRequired,
    // liste des opérations associées à la transaction
    operations: PropTypes.arrayOf(PropTypes.shape({
      // clé primaire de l'opération dans la base de l'API
      pk: PropTypes.number.isRequired,
      // montant associé au crédit (centimes)
      credit: PropTypes.number.isRequired,
      // montant associé au débit (centimes)
      debit: PropTypes.number.isRequired,
      // label associé à l'opération
      label: PropTypes.string.isRequired,
      // clé primaire du compte lié à l'opération
      account: PropTypes.number.isRequired,
      // nom complet du compte lié à l'opération
      accountFullName: PropTypes.string.isRequired,
    })).isRequired,
    balance: PropTypes.number,
  }).isRequired,
  /**
   * Flag indiquant si la transaction est modifiée ou non
   */
  modified: PropTypes.bool.isRequired,
  /**
   * Flag indiquant si la transaction peut être éditée ou non
   */
  readOnly: PropTypes.bool.isRequired,
  /**
   * Ensemble des fonctions de callback
   */
  callbacks: PropTypes.objectOf(PropTypes.func).isRequired,
};

export default memo(TransactionDetail);
