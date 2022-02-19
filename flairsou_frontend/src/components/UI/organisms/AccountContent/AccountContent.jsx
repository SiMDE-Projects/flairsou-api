import React from 'react';
import PropTypes from 'prop-types';
import { Container, Grid, Header } from 'semantic-ui-react';
import TransactionList from '../../molecules/TransactionList/TransactionList';

import currencyFormat from '../../../../utils/currencyFormat';

import Reconciliation from '../../atoms/Reconciliation/Reconciliation';

const AccountContent = ({ account }) => (
  <Container>
    <Grid>
      <Grid.Column floated="left" width={8}>
        <Header as="h1">{account.name}</Header>
        <Header sub>{account.fullName}</Header>
      </Grid.Column>
      <Grid.Column floated="right" width={8}>
        <p style={{ textAlign: 'right' }}>
          Solde :
          &nbsp;
          {currencyFormat(account.balance)}
          &nbsp;
          €
        </p>
        <div style={{ textAlign: 'right' }}>
          <Reconciliation
            accountID={account.pk}
            accountFullName={account.fullName}
          />
        </div>
      </Grid.Column>
    </Grid>

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
