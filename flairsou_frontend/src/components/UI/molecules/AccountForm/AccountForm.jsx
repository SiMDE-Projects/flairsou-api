import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import {
  Container,
  Divider,
  Form,
  Header,
} from 'semantic-ui-react';

import { AccountTypesSelect } from '../../../../assets/accountTypeMapping';
import accountShape from '../../../../shapes/accountShape/accountShape';
import { AppContext } from '../../../contexts/contexts';
import ErrorLevels from '../../../../assets/errorLevels';

const AccountForm = ({ account }) => {
  const appContext = useContext(AppContext);

  const [accountName, setAccountName] = useState(account?.name || '');
  const [accountIsVirtual, setAccountIsVirtual] = useState(account?.virtual || false);
  const [accountBook, setAccountBook] = useState(null);
  const [accountType, setAccountType] = useState(account?.account_type);
  const [accountParent, setAccountParent] = useState(account?.parent || null);
  const [accountAssociatedEntity, setAccountAssociatedEntity] = useState(
    account?.associated_entity || null,
  );

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [parentsAccounts, setParentsAccounts] = useState([]);
  const [parentsAccountsLoading, setParentsAccountsLoading] = useState(false);
  const [userBooks, setUserBooks] = useState([]);
  const [associatedEntities, setAssociatedEntities] = useState([]);

  const [accountCreated, setAccountCreated] = useState(null);

  const getFlatBooks = useCallback((r, currBook) => {
    r.push({ value: currBook.book, text: `${currBook.shortname} - ${currBook.name}` });
    if (currBook.asso_set.length > 0) {
      r.push(...currBook.asso_set.reduce(getFlatBooks, []));
    }
    return r;
  }, []);

  const getFlatAccounts = useCallback((r, currAccount) => {
    if (currAccount.virtual) {
      r.push({
        value: currAccount.pk,
        text: currAccount.name,
        account_type: currAccount.account_type,
      });
    }
    if (currAccount.account_set.length > 0) {
      r.push(...currAccount.account_set.reduce(getFlatAccounts, []));
    }
    return r;
  }, []);

  const getFlatAssociatedEntity = useCallback((r, currAssociatedEntity) => {
    r.push({
      value: currAssociatedEntity.asso_id,
      text: `${currAssociatedEntity.shortname} - ${currAssociatedEntity.name}`,
    });
    if (currAssociatedEntity.asso_set.length > 0) {
      r.push(...currAssociatedEntity.asso_set.reduce(getFlatAssociatedEntity, []));
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

  const submitForm = () => {
    setIsSubmitted(true);

    const body = {
      name: accountName,
      account_type: accountType,
      virtual: accountIsVirtual,
      book: accountBook.value,
      parent: accountParent,
    };

    if (accountAssociatedEntity) {
      body.associated_entity = accountAssociatedEntity;
    }

    if (account?.pk) {
      return;
    }

    fetch('/api/accounts/', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response?.pk) {
          setAccountCreated(response.pk);
        } else {
          appContext.setAlert({
            message: response.non_field_errors,
            level: ErrorLevels.WARN,
          });
        }
        setIsSubmitted(false);
      });
  };

  useEffect(() => {
    if (userBooks.length === 0 && appContext.assos.length > 0) {
      const flatBooks = appContext.assos.reduce(getFlatBooks, []);
      setUserBooks(flatBooks);
      setAccountBook(filterBook(flatBooks));
      setParentsAccounts([]);
    }
  }, [userBooks, appContext.assos, getFlatBooks, filterBook]);

  useEffect(() => {
    if (accountBook !== null) {
      setParentsAccountsLoading(true);
      fetch(`/api/books/${accountBook.value}/accounts/`)
        .then((response) => response.json())
        .then((response) => {
          setParentsAccounts(response.account_set
            .reduce(getFlatAccounts, [])
            .filter((a) => a.account_type === accountType));
          setParentsAccountsLoading(false);
          setAccountParent(null);
        });

      setAssociatedEntities(
        appContext
          .assos
          .filter((a) => a.book === accountBook.value)[0]
          ?.asso_set
          .reduce(getFlatAssociatedEntity, []),
      );
    }
  }, [accountBook, accountType, appContext.assos, getFlatAccounts, getFlatAssociatedEntity]);

  return (
    <Container text>
      {
        accountCreated
        && <Redirect to={`/accounts/${accountCreated}`} />
      }
      <Header as="h2">{ account?.name ? 'Éditer un compte' : 'Créer un compte'}</Header>
      <Divider />
      <Form onSubmit={submitForm} loading={isSubmitted}>
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
          loading={userBooks.length === 0}
          label="Livre associé"
          required
          value={accountBook?.value}
          onChange={(e, { value }) => setAccountBook(filterBook(userBooks, value))}
        />
        {
          accountBook !== null && (
            <>
              <Form.Select
                options={parentsAccounts}
                loading={parentsAccountsLoading}
                label="Compte parent"
                clearable
                value={accountParent}
                onChange={(e, { value }) => setAccountParent(value)}
              />
              {
                associatedEntities?.length > 0 && (
                  <Form.Select
                    options={associatedEntities}
                    label="Entité associée"
                    clearable
                    value={accountAssociatedEntity}
                    onChange={(e, { value }) => setAccountAssociatedEntity(value)}
                  />
                )
              }
            </>
          )
        }
        <Form.Button
          content={account?.name ? 'Modifier' : 'Créer'}
          primary
          loading={isSubmitted}
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
