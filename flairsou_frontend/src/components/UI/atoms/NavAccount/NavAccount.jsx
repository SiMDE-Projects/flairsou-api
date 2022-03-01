import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import { AppContext } from '../../../contexts/contexts';

import './NavAccount.css';

// affiche le nom du compte et un lien vers la page associée
const NavAccount = ({ account, depth = 0 }) => {
  const appContext = useContext(AppContext);

  return (
    <div className={`nav-account-level-${depth}`}>
      <Icon name="university" />
      {
          account.virtual
            ? account.name
            : (
              <Link to={`/accounts/${account.pk}`}>
                {appContext.accountActive === account.pk
                  ? (<b>{account.name}</b>)
                  : account.name}
              </Link>
            )
        }
    </div>
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
  depth: PropTypes.number,
};

NavAccount.defaultProps = {
  depth: 0,
};

export default NavAccount;
