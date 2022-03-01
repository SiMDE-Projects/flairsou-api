import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Header, Button, Grid,
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
          <Grid>
            <Grid.Column floated="left" width={8}>
              <Header as="h1">{appContext.assoActive.shortname}</Header>
              <Header sub>{appContext.assoActive.name}</Header>
              <p>{AssoTypeNames[appContext.assoActive.asso_type]}</p>
            </Grid.Column>
          </Grid>
          <Grid>
            <Grid.Column floated="left" width={8}>
              <Header as="h3">Comptes de l&apos;association</Header>
            </Grid.Column>
            <Grid.Column floated="right" width={8} textAlign="right">
              <Button>
                <Link to="/accounts/create">Créer un nouveau compte</Link>
              </Button>
            </Grid.Column>
          </Grid>
          <AccountList accounts={appContext.accountList} />
        </Container>
      )
      : <p>Pas d&apos;asso active</p>
  );
};

export default BookContent;
