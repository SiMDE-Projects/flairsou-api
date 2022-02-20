import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// affiche le nom du compte dans la navbar ainsi que la liste de ses sous-comptes,
// et met en place un lien pour arriver sur la page correspondant à la liste des
// opérations du compte
const NavAccount = ({ account }) => (
  <>
    <li>
      <Link to={`/account/${account.pk}`}>
        {account.name}
      </Link>
    </li>
    <ul>
      {
        account.account_set.map((subaccount) => (
          <NavAccount key={`acc-${subaccount.pk}`} account={subaccount} />))
      }
    </ul>
  </>
);

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
