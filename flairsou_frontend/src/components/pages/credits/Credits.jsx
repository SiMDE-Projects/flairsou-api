import React, { memo } from 'react';
import { Container, Header } from 'semantic-ui-react';
import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';

const CreditsContent = () => (
  <Container text>
    <Header as="h1" content="Crédits" />
    <p>
      Liste des contributeurs : LISTE.
    </p>
  </Container>
);

const Credits = () => <ContentWrapper content={<CreditsContent />} />;

export default memo(Credits);
