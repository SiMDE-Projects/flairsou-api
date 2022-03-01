import React, { Fragment } from 'react';

import { Link } from 'react-router-dom';
import { Table, Icon } from 'semantic-ui-react';

import NavAccount from '../../atoms/NavAccount/NavAccount';
import currencyFormat from '../../../../utils/currencyFormat';

import { AccountTypesString } from '../../../../assets/accountTypeMapping';

// déploie l'arbre des comptes dans la navbar récursivement en adaptant le
// niveau de profondeur
const expandAccountTree = (accountList, depth = 0) => (
  accountList.map((account) => (
    <Fragment key={`acc-${account.pk}`}>
      <Table.Row>
        <Table.Cell content={<NavAccount account={account} depth={depth} />} />
        <Table.Cell content={AccountTypesString[account.account_type]} />
        <Table.Cell collapsing textAlign="right" content={`${currencyFormat(account.balance)} €`} />
        <Table.Cell collapsing>
          <Link to={`/accounts/edit/${account.pk}`}>
            <Icon name="edit" title="Modifier le compte" />
          </Link>
        </Table.Cell>
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
        <Table.HeaderCell textAlign="right" content="Solde" />
        <Table.HeaderCell content="" />
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {expandAccountTree(accounts)}
    </Table.Body>
  </Table>
);

export default AccountList;
