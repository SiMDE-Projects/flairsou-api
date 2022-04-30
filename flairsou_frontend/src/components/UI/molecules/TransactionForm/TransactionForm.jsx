import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';

import {
  Container,
  Header,
  Divider,
  Table,
  Button,
  Icon,
  Popup,
} from 'semantic-ui-react';

import Operation from '../../atoms/Transaction/Operation/Operation';

const TransactionForm = ({ transaction }) => (
  <Container>
    <Header as="h1">
      Détails de la transaction
    </Header>

    <Table definition collapsing>
      <Table.Body>
        <Table.Row>
          <Table.Cell content="Date" />
          <Table.Cell content={transaction.date} />
        </Table.Row>
        <Table.Row>
          <Table.Cell content="Transaction pointée" />
          <Table.Cell content={transaction.checked ? 'Oui' : 'Non'} />
        </Table.Row>
        <Table.Row>
          <Table.Cell content="Transaction rapprochée" />
          <Table.Cell content={transaction.is_reconciliated ? 'Oui' : 'Non'} />
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
        {transaction.operations.map((operation) => (
          <Table.Row key={`op-tr-details-${operation.pk}`}>
            <Operation
              operation={operation}
              accountName={operation.accountFullName}
              clickToExpand={null}
              active={false}
              readOnly={false}
              updateCallback={(operation) => {}}
              transactionModified={() => {}}
            />
            <Table.Cell textAlign="center" content={<Icon link name="delete" color="red" />} />
          </Table.Row>
        ))}
      </Table.Body>
    </Table>

    <Button color="blue" icon labelPosition="left">
      <Icon name="add" />
      Ajouter une opération
    </Button>

    <Button color="green" icon labelPosition="left">
      <Icon name="save" />
      Enregistrer
    </Button>

    <Button color="brown" icon labelPosition="left">
      <Icon name="undo" />
      Réinitialiser
    </Button>

    <Divider />
    <Header as="h2">
      Liste des justificatifs
    </Header>
  </Container>
);

TransactionForm.propTypes = {
  transaction: PropTypes.shape({
    pk: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    is_reconciliated: PropTypes.bool.isRequired,
    checked: PropTypes.bool.isRequired,
    invoice: PropTypes.string,
    operations: PropTypes.arrayOf(PropTypes.shape({
      pk: PropTypes.number.isRequired,
      credit: PropTypes.number.isRequired,
      debit: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      account: PropTypes.number.isRequired,
      accountFullName: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
};

export default memo(TransactionForm);
