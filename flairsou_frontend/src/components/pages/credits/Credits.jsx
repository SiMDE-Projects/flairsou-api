import React, { useState, useEffect, memo } from 'react';
import {
  Container, Header, List, Image,
} from 'semantic-ui-react';
import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';

const CreditsContent = () => {
  const [contribList, setContribList] = useState([]);

  useEffect(() => {
    const URL = 'https://api.github.com/repos/SiMDE-Projects/flairsou-api/contributors?q=contributions&order=desc';

    fetch(URL)
      .then((response) => response.json())
      .then((response) => {
        // récupération des contributeurs sur github
        const contribs = response.filter((contrib) => contrib.type !== 'Bot');
        // récupération des informations spécifiques utilisateur
        const contribsUsers = Promise.all(
          contribs.map((user) => fetch(user.url)),
        );
        // construction de la liste des contributeurs
        contribsUsers.then((contribsResponses) => {
          const contribsJson = Promise.all(
            contribsResponses.map((resp) => resp.json()),
          );
          contribsJson.then((jsonResps) => setContribList(jsonResps.map((user) => (
            {
              username: user.login,
              name: user.name,
              avatar: user.avatar_url,
              url: user.html_url,
            }))));
        });
      });
  }, []);

  return (
    <Container text>
      <Header as="h1" content="Crédits" />
      <p>
        Liste des contributeurs :
      </p>
      <List divided relaxed verticalAlign="middle">
        { contribList.map((contrib) => (
          <List.Item key={contrib.username}>
            <Image avatar src={contrib.avatar} />
            <List.Content>
              <List.Header>
                {contrib.name}
              </List.Header>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </Container>
  );
};

const Credits = () => <ContentWrapper content={<CreditsContent />} />;

export default memo(Credits);
