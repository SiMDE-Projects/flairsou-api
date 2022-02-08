import React from 'react';
import PropTypes from 'prop-types';
import { Container, Header } from 'semantic-ui-react';
import TransactionList from '../../molecules/TransactionList/TransactionList';

import currencyFormat from '../../../../utils/currencyFormat';

const AccountContent = ({ account }) => (
  <Container>
    <Header as="h1">{account.name}</Header>
    {account.fullName}
    <p>
      Solde :
      {' '}
      {currencyFormat(account.balance)}
      {' '}
      €
    </p>
    {
      account.virtual
        ? <>Compte virtuel</>
        : (
          <TransactionList
            accountID={account.pk}
            accountType={account.account_type}
          />
        )
    }
  </Container>
);

AccountContent.propTypes = {
  account: PropTypes.shape({
    pk: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    account_type: PropTypes.number.isRequired,
    virtual: PropTypes.bool.isRequired,
    parent: PropTypes.number,
    book: PropTypes.number.isRequired,
    associated_entity: PropTypes.string,
    balance: PropTypes.number.isRequired,
  }).isRequired,
};

export default AccountContent;
