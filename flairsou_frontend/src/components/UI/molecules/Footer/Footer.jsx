import React, { memo } from 'react';
import {
  Container, Grid, Header, Icon, List, Segment,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <Segment inverted vertical style={{ padding: '3em 5em' }}>
    <Container textAlign="center">
      <Grid divided inverted stackable>
        <Grid.Column width={8}>
          <Header inverted as="h4" content="Liens" />
          <List link inverted>
            <List.Item>
              <Link to="/doc">Documentation</Link>
            </List.Item>
            <List.Item>
              <Link to="/credits">Crédits</Link>
            </List.Item>
            <List.Item>
              <a href="mailto:flairsou@assos.utc.fr">Contact</a>
            </List.Item>
            <List.Item>
              <a href="https://github.com/SiMDE-Projects/flairsou-api/issues">Reporter un bug</a>
            </List.Item>
            <List.Item>
              <a href="https://github.com/SiMDE-Projects/flairsou-api">Sources</a>
            </List.Item>
          </List>
        </Grid.Column>
        <Grid.Column width={8}>
          <Header inverted as="h4" content="Contributeurs" />
          <p>
            <Icon name="code" />
            &nbsp;
            avec le
            &nbsp;
            <Icon name="heart" />
            &nbsp;
            par le SiMDE.
          </p>
          <p>
            {`Flairsou version ${__VERSION__}`}
          </p>
        </Grid.Column>
      </Grid>
    </Container>
  </Segment>
);

export default memo(Footer);
