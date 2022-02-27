import React, { useEffect, useContext } from 'react';
import {
  Container, Header, Button,
} from 'semantic-ui-react';

import { AppContext } from '../../../contexts/contexts';
import { AssoTypeNames } from '../../../../assets/assoTypeMapping';
import AccountList from '../../molecules/AccountList/AccountList';

const BookContent = () => {
  const appContext = useContext(AppContext);

  useEffect(() => {
    appContext.setAccountActive(-1);
  }, [appContext]);

  return (
    appContext.assoActive
      ? (
        <Container>
          <Header as="h1">{appContext.assoActive.shortname}</Header>
          <Header as="h2">{appContext.assoActive.name}</Header>
          <p>{AssoTypeNames[appContext.assoActive.asso_type]}</p>
          <Header as="h3">Comptes de l&apos;association</Header>
          <AccountList accounts={appContext.accountList} />
          <Button>Créer un nouveau compte</Button>
        </Container>
      )
      : <p>Pas d&apos;asso active</p>
  );
};

export default BookContent;
