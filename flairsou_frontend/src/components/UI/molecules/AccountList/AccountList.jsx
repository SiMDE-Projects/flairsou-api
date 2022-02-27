import React, { Fragment } from 'react';

import { Table } from 'semantic-ui-react';

import NavAccount from '../../atoms/NavAccount/NavAccount';
import currencyFormat from '../../../../utils/currencyFormat';

// déploie l'arbre des comptes dans la navbar récursivement en adaptant le
// niveau de profondeur
const expandAccountTree = (accountList, depth = 0) => (
  accountList.map((account) => (
    <Fragment key={`acc-${account.pk}`}>
      <Table.Row>
        <Table.Cell content={<NavAccount account={account} depth={depth} />} />
        <Table.Cell content="type" />
        <Table.Cell collapsing textAlign="right" content={`${currencyFormat(account.balance)} €`} />
      </Table.Row>
      {expandAccountTree(account.account_set, depth + 1)}
    </Fragment>
  ))
);

const AccountList = ({ accounts }) => (
  <Table basic compact>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell content="Nom du compte" />
        <Table.HeaderCell content="Type" />
        <Table.HeaderCell content="Solde" />
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {expandAccountTree(accounts)}
    </Table.Body>
  </Table>
);

export default AccountList;
