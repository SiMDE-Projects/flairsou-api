import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Table, Icon } from 'semantic-ui-react';

import NavAccount from '../../atoms/NavAccount/NavAccount';
import currencyFormat from '../../../../utils/currencyFormat';

import { AccountTypesString } from '../../../../assets/accountTypeMapping';
import ConfirmDeleteObject from '../../atoms/ConfirmDeleteObject/ConfirmDeleteObject';
import accountShape from '../../../../shapes/accountShape/accountShape';

const deleteAccount = (accountPk) => {
  fetch(`/api/accounts/${accountPk}/`, { method: 'DELETE' })
    .then((response) => {
      console.log(response);
    });
};

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
        <Table.Cell collapsing>
          {account.account_set.length === 0 && (
            <ConfirmDeleteObject
              objectName="compte"
              onConfirm={() => deleteAccount(account.pk)}
            />
          )}
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
        <Table.HeaderCell content="" />
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {expandAccountTree(accounts)}
    </Table.Body>
  </Table>
);

AccountList.propTypes = {
  accounts: PropTypes.arrayOf(PropTypes.shape(accountShape)).isRequired,
};

export default AccountList;
