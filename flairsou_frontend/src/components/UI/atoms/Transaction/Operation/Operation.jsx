import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Input } from 'semantic-ui-react';

import { currencyFormat, checkCurrencyFormat } from '../../../../../utils/currencyFormat';

/**
 * Composant effectuant le rendu d'une opération particulière
 */
const Operation = ({
  operation, accountName, active, reconciliated,
}) => {
  // affichage du crédit et du débit seulement si le montant est non nul
  const [credit, setCredit] = useState(operation.credit > 0 ? currencyFormat(operation.credit) : '');
  const [debit, setDebit] = useState(operation.debit > 0 ? currencyFormat(operation.debit) : '');

  const updateCredit = (event) => {
    setCredit(checkCurrencyFormat(event.target.value));
  };

  const updateDebit = (event) => {
    setDebit(checkCurrencyFormat(event.target.value));
  };

  return (
    <>
      <Table.Cell active={active}>
        { reconciliated ? operation.label
          : <Input transparent defaultValue={operation.label} />}
      </Table.Cell>
      <Table.Cell active={active}>
        {accountName}
      </Table.Cell>
      <Table.Cell active={active} textAlign="right">
        {reconciliated ? credit
          : (
            <Input
              transparent
              value={credit}
              fluid
              onChange={(event) => updateCredit(event)}
            />
          )}
      </Table.Cell>
      <Table.Cell active={active} textAlign="right">
        {reconciliated ? debit
          : (
            <Input
              transparent
              value={debit}
              fluid
              onChange={(event) => updateDebit(event)}
            />
          )}
      </Table.Cell>
    </>
  );
};

Operation.propTypes = {
  // opération à afficher
  operation: PropTypes.shape({
    // clé primaire de l'opération dans la base de l'API
    pk: PropTypes.number.isRequired,
    // montant associé au crédit (centimes)
    credit: PropTypes.number.isRequired,
    // montant associé au débit (centimes)
    debit: PropTypes.number.isRequired,
    // label de l'opération
    label: PropTypes.string.isRequired,
    // clé primaire du compte lié à l'opération
    account: PropTypes.number.isRequired,
    // nom complet du compte lié à l'opération
    accountFullName: PropTypes.string.isRequired,
  }).isRequired,
  // nom de compte à afficher (ce nom ne correspond pas forcément au nom
  // du compte lié à l'opération : dans le cas d'une transaction simple, on
  // affiche le nom de l'autre compte pour indiquer vers quel compte se fait le
  // transfert, et dans le cas d'une transaction répartie, on affiche le nom
  // "Transaction répartie" sur la première ligne et le nom du compte lié à l'opération
  // sur les lignes suivantes)
  // la propriété est un objet jsx
  accountName: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  // indique si la ligne correspond à l'opération courante dans la liste des opérations
  // d'une transaction répartie
  active: PropTypes.bool.isRequired,
  // indique si l'opération fait partie d'une transaction rapprochée, auquel cas les champs
  // ne peuvent pas être édités
  reconciliated: PropTypes.bool.isRequired,
};

export default Operation;
