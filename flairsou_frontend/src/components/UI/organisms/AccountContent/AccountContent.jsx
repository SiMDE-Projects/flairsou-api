import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Container,
  Grid,
  Header,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import TransactionList from '../../molecules/TransactionList/TransactionList';
import currencyFormat from '../../../../utils/currencyFormat';
import accountShape from '../../../../shapes/accountShape/accountShape';

import Reconciliation from '../../atoms/Reconciliation/Reconciliation';

const AccountContent = ({ account }) => {
  // solde affiché du compte
  const [balance, setBalance] = useState(0);

  const updateBalance = (newBalance) => setBalance(newBalance);

  return (
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
            {currencyFormat(balance)}
            &nbsp;
            €
          </p>
          <Link to={{ pathname: `/accounts/edit/${account.pk}` }}>
            <Button floated="right" secondary content="Éditer le compte" />
          </Link>
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
              updateBalanceCallback={updateBalance}
            />
          )
      }
    </Container>
  );
};

AccountContent.propTypes = {
  account: PropTypes.shape(accountShape).isRequired,
};

export default AccountContent;
