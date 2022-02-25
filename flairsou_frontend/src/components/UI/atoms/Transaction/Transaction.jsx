import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table, Icon, Checkbox, Input,
} from 'semantic-ui-react';

import Operation from './Operation/Operation';
import { currencyFormat } from '../../../../utils/currencyFormat';
import ConfirmDeleteOperation from './ConfirmDeleteOperation';

/**
 * Composant effectuant le rendu d'une transaction dans l'affichage d'un compte
 */
const Transaction = ({ transaction, deleteCallback, updateCallback }) => {
  // indique si la transaction doit être étendue ou non (i.e. si il faut
  // afficher toutes les opérations de la transaction)
  const [expand, setExpand] = useState(false);

  const toogleExpand = () => {
    setExpand(!expand);
  };

  // récupération de l'objet correspondant à l'opération à afficher
  const activeOp = transaction.operations[transaction.activeOpId];

  // détermination si la transaction est simple ou répartie
  const multiOps = transaction.operations.length > 2;

  // récupération du nom de l'autre compte (s'il n'y en a qu'un)
  let otherAccountName = null;
  let clickToExpand = null;
  let otherOpId = null;
  if (!multiOps) {
    // détermine l'ID de l'autre opération dans le tableau. Comme il n'y en a que
    // deux (0 et 1), on fait +1 puis %2 pour avoir 1 -> 0 et 0 -> 1.
    otherOpId = (transaction.activeOpId + 1) % 2;
    otherAccountName = transaction.operations[otherOpId].accountFullName;
  } else {
    // si la transaction est répartie, on crée un composant qui affiche
    // la transaction répartie et une petite icône qui permet de déplier la transaction
    clickToExpand = (
      <div
        onClick={toogleExpand}
        onKeyDown={(event) => { if (event.key === 'Enter') toogleExpand(); }}
        role="button"
        tabIndex={0}
        title="Cliquer pour déplier/replier la transaction"
      >
        Transaction répartie&nbsp;
        <Icon
          link
          name={expand ? 'angle double up' : 'angle double down'}
          title={`${expand ? 'Replier' : 'Déplier'} la transaction`}
        />
      </div>
    );
  }

  const operationValidatedCallback = (operation, accountID) => {
    // mise à jour de l'opération dans la transaction
    // spreading pour faire une copie profonde
    const newTransaction = { ...transaction };

    if (!multiOps) {
      // dans le cas où ce n'est pas une transaction répartie, on a uniquement
      // deux opérations : l'opération associée au compte actuel, et celle associée
      // au compte en face.
      // op1 : opération modifiée (affichée en front)
      const op1 = operation;

      // Dans le cas où le montant de l'opération 1 a été modifié, il faut le répercuter sur
      // l'opération en face en inversant les débits et les crédits
      // Dans le cas d'une transaction simple, si le compte est modifié, alors il s'agit du
      // compte de l'opération en face.
      // Le label est le même pour les deux opérations dans ce cas.
      const op2 = {
        ...transaction.operations[otherOpId],
        credit: op1.debit,
        debit: op1.credit,
        account: accountID,
        label: op1.label,
      };

      newTransaction.operations = [op1, op2];
    } else {
      // TODO pour une transaction répartie, mais comment ? ...
    }

    updateCallback(newTransaction);
  };

  return (
    <>
      <Table.Row>
        <Table.Cell textAlign="center">
          <Icon
            name={transaction.is_reconciliated ? 'lock' : 'unlock'}
            color={transaction.is_reconciliated ? 'red' : 'green'}
            title={`Transaction ${transaction.is_reconciliated ? '' : 'non'} rapprochée`}
          />
        </Table.Cell>
        <Table.Cell textAlign="center" collapsing>
          {transaction.is_reconciliated
            ? new Date(transaction.date).toLocaleDateString()
            : (
              <Input
                type="date"
                transparent
                defaultValue={transaction.date}
              />
            )}
        </Table.Cell>
        <Operation
          operation={activeOp}
          accountName={otherAccountName}
          clickToExpand={clickToExpand}
          active={false}
          reconciliated={transaction.is_reconciliated}
          updateCallback={operationValidatedCallback}
        />
        <Table.Cell textAlign="right">{currencyFormat(transaction.balance)}</Table.Cell>
        <Table.Cell textAlign="center">
          <Checkbox
            defaultChecked={transaction.checked}
            disabled={transaction.is_reconciliated}
          />
        </Table.Cell>
        <Table.Cell textAlign="center">o</Table.Cell>
        <Table.Cell textAlign="center">
          {!transaction.is_reconciliated && (
            <ConfirmDeleteOperation
              onConfirm={() => deleteCallback(transaction.pk)}
            />
          )}
        </Table.Cell>
      </Table.Row>
      {
        // si il faut étendre la transaction, on rajoute autant de lignes que nécessaire
        expand && transaction.operations.map((operation) => (
          <Table.Row key={`op-${operation.pk}`}>
            <Table.Cell colSpan="2" />
            <Operation
              operation={operation}
              accountName={operation.accountFullName}
              active={operation.pk === activeOp.pk}
              updateCallback={operationValidatedCallback}
              reconciliated={transaction.is_reconciliated}
            />
            <Table.Cell colSpan="4" />
          </Table.Row>
        ))
      }
    </>
  );
};

Transaction.propTypes = {
  // objet transaction à afficher
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
  deleteCallback: PropTypes.func.isRequired,
  updateCallback: PropTypes.func.isRequired,
};

export default Transaction;
