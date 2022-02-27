import React, { useEffect, useContext } from 'react';
import { Container, Header } from 'semantic-ui-react';

import { AppContext } from '../../../contexts/contexts';
import { AssoTypeNames } from '../../../../assets/assoTypeMapping';

const BookContent = () => {
  const appContext = useContext(AppContext);

  return (
    appContext.assoActive
      ? (
        <Container>
          <Header as="h1">{appContext.assoActive.shortname}</Header>
          <Header as="h2">{appContext.assoActive.name}</Header>
          <p>{AssoTypeNames[appContext.assoActive.asso_type]}</p>
        </Container>
      )
      : <p>Pas d&apos;asso active</p>
  );
};

export default BookContent;
