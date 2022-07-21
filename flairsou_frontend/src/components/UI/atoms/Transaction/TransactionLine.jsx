import React, {
  memo, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Table, Icon, Checkbox, Input,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import OneLineTransaction from './OneLineTransaction';
import MultiOpsTransaction from './MultiOpsTransaction';
import { centsToStr } from '../../../../utils/currencyFormat';
import ConfirmDeleteObject from '../ConfirmDeleteObject/ConfirmDeleteObject';
import TransactionIcon from './TransactionIcon';
import Operation from './Operation/Operation';

/**
 * TODO
 */
const TransactionLine = ({
  transaction, modified, readOnly,
  updateDate, updateCheck, updateOperation, updateOperations,
  validateTransaction, deleteTransaction,
}) => {
  /**
   * état indiquant si la transaction doit être déployée ou non (pour les transactions
   * multiples uniquement).
   */
  const [expand, setExpand] = useState(false);

  // est-ce qu'il s'agit d'une transaction simple ou répartie
  const simpleTransaction = transaction.operations.length === 2;

  return (
    <>
      <Table.Row>
        <Table.Cell textAlign="center" collapsing>
          <TransactionIcon
            transactionPk={transaction.pk}
            transactionReconciliated={transaction.is_reconciliated}
            modified={modified}
          />
        </Table.Cell>
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
        {simpleTransaction
          ? (
            <OneLineTransaction
              initialTransaction={transaction}
              readOnly={readOnly}
              operationsUpdatedCallback={updateOperations}
              transactionValidatedCallback={validateTransaction}
            />
          )
          : (
            <MultiOpsTransaction
              initialTransaction={transaction}
              expandCallback={(expandValue) => setExpand(expandValue)}
            />
          )}
        <Table.Cell textAlign="right">{centsToStr(transaction.balance)}</Table.Cell>
        <Table.Cell textAlign="center">
          <Checkbox
            checked={transaction.checked}
            disabled={readOnly}
            onChange={(event, data) => updateCheck(data.checked)}
          />
        </Table.Cell>
        <Table.Cell textAlign="center" collapsing>
          <Link to={`/transaction/${transaction.pk}`}>
            <Icon
              name="edit"
              link
              color="blue"
              title="Modifier les détails de la transaction"
            />
          </Link>
        </Table.Cell>
        <Table.Cell textAlign="center" collapsing>
          {!readOnly && (
            <ConfirmDeleteObject
              objectName="transaction"
              objectDetail={transaction.operations[transaction.activeOpId].label}
              onConfirm={deleteTransaction}
            />
          )}
        </Table.Cell>
      </Table.Row>
      {
        // si il faut étendre la transaction, on rajoute autant de lignes que nécessaire
        expand && transaction.operations.map((operation, opId) => (
          <Table.Row key={`op-${operation.pk}`}>
            <Table.Cell colSpan="2" />
            <Operation
              initialOp={operation}
              active={opId === transaction.activeOpId}
              readOnly={readOnly}
              updateCallback={updateOperation}
              operationValidatedCallback={validateTransaction}
            />
            <Table.Cell colSpan="4" />
          </Table.Row>
        ))
      }
    </>
  );
};

TransactionLine.propTypes = {
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
    // solde partiel suite à cette transaction
    balance: PropTypes.number.isRequired,
    // ID de l'opération active dans la transaction
    activeOpId: PropTypes.number.isRequired,
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
};

export default memo(TransactionLine);
