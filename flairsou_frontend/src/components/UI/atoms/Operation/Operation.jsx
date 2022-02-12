import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon } from 'semantic-ui-react';

import RenderOperation from './RenderOperation/RenderOperation';
import currencyFormat from '../../../../utils/currencyFormat';

const Operation = ({ transaction }) => {
  // indique si la transaction doit être étendue ou non (i.e. si il faut
  // afficher toutes les opérations de la transaction)
  const [expand, setExpand] = useState(false);

  const toogleExpand = () => {
    setExpand(!expand);
  };

  // récupération de l'objet correspondant à l'opération à afficher
  const currentOp = transaction.operations[transaction.currentOpId];

  // détermination si la transaction est simple ou répartie
  const multiOps = transaction.operations.length > 2;

  // récupération du nom de l'autre compte (s'il n'y en a qu'un)
  let otherAccountName = '';
  if (!multiOps) {
    // détermine l'ID de l'autre opération dans le tableau. Comme il n'y en a que
    // deux (0 et 1), on fait +1 puis %2 pour avoir 1 -> 0 et 0 -> 1.
    const otherOpId = (transaction.currentOpId + 1) % 2;
    otherAccountName = transaction.operations[otherOpId].accountFullName;
  } else {
    otherAccountName = (
      <>
        Transaction répartie&nbsp;
        <Icon
          link
          name={expand ? 'angle double up' : 'angle double down'}
          onClick={toogleExpand}
        />
      </>
    );
  }

  return (
    <>
      <Table.Row>
        <Table.Cell textAlign="center">
          <Icon
            name={transaction.checked ? 'lock' : 'unlock'}
            color={transaction.checked ? 'red' : 'green'}
          />
        </Table.Cell>
        <Table.Cell>{transaction.date}</Table.Cell>
        <RenderOperation
          operation={currentOp}
          accountName={otherAccountName}
        />
        <Table.Cell textAlign="right">{currencyFormat(transaction.balance)}</Table.Cell>
        <Table.Cell textAlign="center">o</Table.Cell>
      </Table.Row>
      {
        // si il faut étendre la transaction, on rajoute autant de lignes que nécessaire
        expand && transaction.operations.map((operation) => (
          <Table.Row>
            <Table.Cell colSpan="2" />
            <RenderOperation
              operation={operation}
              accountName={operation.accountFullName}
              expandedLine
              active={operation.pk === currentOp.pk}
            />
            <Table.Cell colSpan="2" />
          </Table.Row>
        ))
      }
    </>
  );
};

Operation.propTypes = {
  transaction: PropTypes.shape({
    pk: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    invoice: PropTypes.string,
    balance: PropTypes.number.isRequired,
    currentOpId: PropTypes.number.isRequired,
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

export default Operation;
