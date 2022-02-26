import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Divider,
  Form,
  Header,
} from 'semantic-ui-react';

import { AccountTypesSelect } from '../../../../assets/accountTypeMapping';
import accountShape from '../../../../shapes/accountShape/accountShape';
import { AppContext } from '../../../contexts/contexts';

const AccountForm = ({ account }) => {
  const appContext = useContext(AppContext);

  const [accountName, setAccountName] = useState(account?.name || '');
  const [accountIsVirtual, setAccountIsVirtual] = useState(account?.virtual || false);
  const [accountBook, setAccountBook] = useState(null);
  const [accountType, setAccountType] = useState(account?.account_type || null);

  const [accounts, setAccounts] = useState(null);
  const [userBooks, setUserBooks] = useState([]);

  const getFlatBooks = useCallback((r, currBook) => {
    r.push({ value: currBook.book, text: currBook.shortname });
    if (currBook.asso_set.length > 0) {
      r.push(...currBook.asso_set.reduce(getFlatBooks, []));
    }
    return r;
  }, []);

  const filterBook = useCallback((booksToFilter, id = null) => {
    const filteredBooks = booksToFilter.filter((b) => b.value === (id || account?.book));
    if (filteredBooks.length > 0) {
      return filteredBooks[0];
    }
    return null;
  }, [account?.book]);

  useEffect(() => {
    if (userBooks.length === 0 && appContext.assos.length > 0) {
      const flatBooks = appContext.assos.reduce(getFlatBooks, []);
      setUserBooks(flatBooks);
      setAccountBook(filterBook(flatBooks));
    }
  }, [userBooks, appContext.assos, getFlatBooks, filterBook]);

  const accountParentOptions = [{
    value: 'Aucun', text: 'Aucun',
  }];
  const associatedEntityOptions = [{
    value: 'Aucun', text: 'Aucun',
  }];

  return (
    <Container>
      <Header as="h2">{ account?.name ? 'Éditer un compte' : 'Créer un compte'}</Header>
      <Divider />
      <Form>
        <Form.Input
          label="Nom du compte"
          placeholder="Weekend d'intégration"
          required
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />
        <Form.Select
          options={AccountTypesSelect}
          label="Type du compte"
          required
          value={accountType}
          onChange={(e, { value }) => setAccountType(value)}
        />
        <Form.Checkbox
          label="Compte virtuel"
          checked={accountIsVirtual}
          onChange={() => setAccountIsVirtual(!accountIsVirtual)}
        />
        <Form.Select
          options={userBooks}
          label="Livre associé"
          required
          value={accountBook?.value}
          onChange={(e, { value }) => setAccountBook(filterBook(userBooks, value))}
        />
        {
          false && (
            <Form.Select
              options={accountParentOptions}
              label="Compte parent"
            />
          )
        }
        {
          false && (
            <Form.Select
              options={associatedEntityOptions}
              label="Entité associée"
            />
          )
        }
        <Form.Button
          content="Créer"
          primary
        />
      </Form>
    </Container>
  );
};

AccountForm.propTypes = {
  account: PropTypes.shape(accountShape),
};

AccountForm.defaultProps = {
  account: null,
};

export default AccountForm;
