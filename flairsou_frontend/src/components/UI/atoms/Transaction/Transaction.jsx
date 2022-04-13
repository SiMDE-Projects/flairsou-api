import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Table, Icon, Checkbox, Input,
} from 'semantic-ui-react';

import Operation from './Operation/Operation';
import { centsToStr } from '../../../../utils/currencyFormat';
import ConfirmDeleteObject from '../ConfirmDeleteObject/ConfirmDeleteObject';

/**
 * Composant effectuant le rendu d'une transaction dans l'affichage d'un compte
 */
const Transaction = ({
  transaction, readOnlyAccount, deleteCallback, updateCallback, createCallback,
}) => {
  // indique si la transaction doit être étendue ou non (i.e. si il faut
  // afficher toutes les opérations de la transaction)
  const [expand, setExpand] = useState(false);

  // état indiquant si la transaction est en cours de modification ou non
  const [modified, setModified] = useState(false);

  const [date, setDate] = useState('');
  const [checked, setChecked] = useState(false);

  const toogleExpand = () => {
    setExpand(!expand);
  };

  useEffect(() => {
    setDate(transaction.date);
    setChecked(transaction.checked);
  }, [transaction.date, transaction.checked]);

  useEffect(() => {
    if (date === '') return;

    if (date !== transaction.date) {
      setModified(true);
    }
  }, [transaction.date, date]);

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

  const resetModifiedStatus = () => setModified(false);

  const operationValidatedCallback = (operation, accountID) => {
    // mise à jour de l'opération dans la transaction
    // spreading pour faire une copie profonde
    const newTransaction = { ...transaction, date, checked };

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

    if (transaction.pk === 0) {
      // création d'une nouvelle transaction
      createCallback(newTransaction);
    } else {
      // mise à jour
      updateCallback(newTransaction, resetModifiedStatus);
    }
  };

  const dateUpdated = (event) => {
    // On met à jour l'état, et on attend une saisie de Enter pour mettre à jour la transaction,
    // pour éviter de faire une maj API à chaque caractère entré pour une saisie manuelle et pas
    // au calendrier.
    setDate(event.target.value);
  };

  const checkedUpdated = (data) => {
    // met à jour l'état de la transaction
    setChecked(data.checked);

    // met à jour en base aussi : en principe, l'utilisateur va pointer
    // une transaction déjà créée et donc ne va pas nécessairement éditer les
    // champs de la transaction, donc on enregistre systématiquement en base
    // la modification.
    if (transaction.pk !== 0) {
      updateCallback({ ...transaction, checked: data.checked });
    }
  };

  const iconElement = () => {
    if (transaction.pk !== 0 && modified) {
      return (
        <Icon
          name="save"
          color="orange"
          title="Modification en cours, cliquer pour enregistrer"
        />
      );
    }

    if (transaction.is_reconciliated) {
      return (
        <Icon
          name="lock"
          color="red"
          title="Transaction rapprochée"
        />
      );
    }

    if (transaction.pk === 0) {
      return (
        <Icon
          name="arrow alternate circle right"
          color="blue"
          title="Nouvelle transaction"
        />
      );
    }

    return (
      <Icon
        name="unlock"
        color="green"
        title="Transaction non rapprochée"
      />
    );
  };

  const readOnlyTransaction = transaction.is_reconciliated || readOnlyAccount;

  return (
    <>
      <Table.Row>
        <Table.Cell textAlign="center" collapsing>
          {iconElement()}
        </Table.Cell>
        <Table.Cell textAlign="center" collapsing>
          {readOnlyTransaction
            ? new Date(date).toLocaleDateString()
            : (
              <Input
                type="date"
                transparent
                defaultValue={date}
                onChange={dateUpdated}
              />
            )}
        </Table.Cell>
        <Operation
          operation={activeOp}
          accountName={otherAccountName}
          clickToExpand={clickToExpand}
          active={false}
          readOnly={readOnlyTransaction}
          updateCallback={operationValidatedCallback}
          transactionModified={() => setModified(true)}
        />
        <Table.Cell textAlign="right">{centsToStr(transaction.balance)}</Table.Cell>
        <Table.Cell textAlign="center">
          <Checkbox
            checked={checked}
            disabled={readOnlyTransaction}
            onChange={(event, data) => checkedUpdated(data)}
          />
        </Table.Cell>
        <Table.Cell textAlign="center" collapsing>o</Table.Cell>
        <Table.Cell textAlign="center" collapsing>
          {!readOnlyTransaction && (
            <ConfirmDeleteObject
              objectName="transaction"
              objectDetail={activeOp.label}
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
              readOnly={readOnlyTransaction}
              transactionModified={() => setModified(true)}
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
  readOnlyAccount: PropTypes.bool.isRequired,
  deleteCallback: PropTypes.func.isRequired,
  updateCallback: PropTypes.func.isRequired,
  createCallback: PropTypes.func.isRequired,
};

export default memo(Transaction);
