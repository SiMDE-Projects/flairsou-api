import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Container,
  Grid,
  Header,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { centsToStr } from '../../../../utils/currencyFormat';
import TransactionList from '../../molecules/TransactionList/TransactionList';
import accountNodeShape from '../../../../shapes/accountShape/accountNodeShape';

import Reconciliation from '../../atoms/Reconciliation/Reconciliation';

const AccountContent = ({ account, readOnlyAccount }) => {
  // solde affiché du compte
  const [balance, setBalance] = useState(0);

  const updateBalance = (newBalance) => setBalance(newBalance);

  // définition initiale du solde au chargement d'un nouveau compte
  useEffect(() => {
    setBalance(account.balance);
  }, [account]);

  return (
    <>
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
              {centsToStr(balance)}
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
      </Container>
      <Grid centered>
        <Grid.Column width={14}>
          <TransactionList
            account={account}
            readOnlyAccount={readOnlyAccount || account.virtual}
            updateBalanceCallback={updateBalance}
          />
        </Grid.Column>
      </Grid>
    </>
  );
};

AccountContent.propTypes = {
  account: PropTypes.shape(accountNodeShape).isRequired,
  readOnlyAccount: PropTypes.bool.isRequired,
};

export default memo(AccountContent);
