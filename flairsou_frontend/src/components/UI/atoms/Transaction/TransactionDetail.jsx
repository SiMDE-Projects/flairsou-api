import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

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
  transaction, modified, readOnly,
  updateDate, updateCheck, updateOperation, updateOperations,
  validateTransaction, deleteTransaction, reinitializeTransaction,
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
      updateOperations(newOps);
    }
  }, [transaction, updateOperations]);

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
      updateOperations([...transaction.operations, { ...emptyOperation, localKey: uuidv4() }]);
    }
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
                    onChange={updateDate}
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
                onChange={(event, data) => updateCheck(data.checked)}
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
                  updateOperation(updatedOp, i);
                }}
                operationValidatedCallback={validateTransaction}
              />
              <Table.Cell textAlign="center" content={<Icon link name="delete" color="red" />} />
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Button color="blue" icon labelPosition="left" onClick={() => addNewOperation()}>
        <Icon name="add" />
        Ajouter une opération
      </Button>

      <Button color={modified ? 'green' : 'grey'} icon labelPosition="left" onClick={validateTransaction}>
        <Icon name="save" />
        Enregistrer
      </Button>

      <Button color={modified ? 'brown' : 'grey'} icon labelPosition="left" onClick={reinitializeTransaction}>
        <Icon name="undo" />
        Réinitialiser
      </Button>

      <Divider />
      <Header as="h2">
        Liste des justificatifs
      </Header>
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
    // justificatif associé à la transaction (TODO)
    invoice: PropTypes.string,
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
   * Fonction permettant la mise à jour de la date de la transaction
   */
  updateDate: PropTypes.func.isRequired,
  /**
   * Fonction permettant la mise à jour du flag "checked" de la transaction
   */
  updateCheck: PropTypes.func.isRequired,
  /**
   * Fonction permettant la mise à jour d'une opération particulière. Cette fonction
   * prend en paramètres la nouvelle opération et son identifiant dans la liste
   * des opérations de la transaction.
   */
  updateOperation: PropTypes.func.isRequired,
  /**
   * Fonction permettant la mise à jour de la liste des opérations de la transaction
   */
  updateOperations: PropTypes.func.isRequired,
  /**
   * Fonction permettant de valider la mise à jour ou la création de la transaction
   */
  validateTransaction: PropTypes.func.isRequired,
  /**
   * Fonction permettant de supprimer la transaction
   */
  deleteTransaction: PropTypes.func.isRequired,
  /**
   * Fonction permettant de réinitialiser la transaction
   */
  reinitializeTransaction: PropTypes.func.isRequired,
};

export default memo(TransactionDetail);
