import React from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';
import TransactionList from '../../molecules/TransactionList/TransactionList';

const AccountContent = ({ account }) => (
  <div>
    <div>
      <div>
        <Header as="h1">{account.name}</Header>
      </div>
      <div>
        <p>Solde : solde €</p>
      </div>
    </div>
    <div>
      {
          account.virtual
            ? <>Compte virtuel</>
            : <TransactionList accountID={account.pk} />
      }
    </div>
  </div>
);

AccountContent.propTypes = {
  account: PropTypes.shape({
    pk: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    account_type: PropTypes.number.isRequired,
    virtual: PropTypes.bool.isRequired,
    parent: PropTypes.number,
    book: PropTypes.number.isRequired,
    associated_entity: PropTypes.string,
  }).isRequired,
};

export default AccountContent;
