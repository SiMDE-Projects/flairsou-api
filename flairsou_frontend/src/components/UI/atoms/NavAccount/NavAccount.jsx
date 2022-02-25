import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List } from 'semantic-ui-react';

import { AppContext } from '../../../contexts/contexts';

// affiche le nom du compte dans la navbar ainsi que la liste de ses sous-comptes,
// et met en place un lien pour arriver sur la page correspondant à la liste des
// opérations du compte
const NavAccount = ({ account }) => {
  const appContext = useContext(AppContext);

  return (
    <List.Item>
      <List.Icon name="university" />
      <List.Content>
        {
          account.virtual
            ? account.name
            : (
              <Link to={`/account/${account.pk}`}>
                {appContext.accountActive === account.pk
                  ? (<b>{account.name}</b>)
                  : account.name}
              </Link>
            )
        }
      </List.Content>
      {
      account.account_set.length > 0
      && (
        <List.List>
          {
            account.account_set.map((subaccount) => (
              <NavAccount key={`acc-${subaccount.pk}`} account={subaccount} />))
          }
        </List.List>
      )
      }
    </List.Item>
  );
};

// voir si y'a pas moyen de factoriser ça quelque part, genre définir à un endroit
// les types des trucs renvoyés par l'API
NavAccount.propTypes = {
  account: PropTypes.shape({
    pk: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    account_type: PropTypes.number.isRequired,
    virtual: PropTypes.bool.isRequired,
    balance: PropTypes.number.isRequired,
    account_set: PropTypes.arrayOf(PropTypes.shape({
      pk: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      account_type: PropTypes.number.isRequired,
      virtual: PropTypes.bool.isRequired,
      balance: PropTypes.number.isRequired,
    })).isRequired,
  }).isRequired,
};

export default NavAccount;
