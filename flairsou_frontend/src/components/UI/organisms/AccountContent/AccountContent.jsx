import React from 'react';
import PropTypes from 'prop-types';
import TransactionList from '../../molecules/TransactionList/TransactionList';

const AccountContent = ({ account }) => {
  let content;
  if (account.virtual) {
    content = (<div>Compte virtuel</div>);
  } else {
    content = <TransactionList accountID={account.pk} />;
  }

  return (
    <div>
      <div>
        <div>
          <h1>{account.name}</h1>
        </div>
        <div>
          <p>Solde : solde €</p>
        </div>
      </div>
      <div>
        {content}
      </div>
    </div>
  );
};

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
