import React from 'react';
import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';
import { Container, Header } from 'semantic-ui-react';

const CreditsContent = () => (
  <Container text>
    <Header as="h1" content="Crédits" />
    <p>
      Liste des contributeurs : LISTE.
    </p>
  </Container>
);

const Credits = () => <ContentWrapper content={<CreditsContent />} />;

export default Credits;
