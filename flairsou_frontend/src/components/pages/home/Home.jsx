import React, { useEffect, useState, useContext } from 'react';
import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';
import HomeContent from '../../UI/organisms/HomeContent/HomeContent';
import Provider, { UserContext } from '../../helpers/Provider';

const Home = () => {
  const [userName, setUserName] = useState('NOT_FETCHED');
  const { user, loadUser } = useContext(UserContext);

  const authlinkUrl = '/oauth/authlink';
  const userInfosUrl = '/proxy_pda/get_user_infos';
  const assosUrl = '/proxy_pda/get_list_assos';

  // get name of user
  useEffect(() => {
    fetch(userInfosUrl)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          response.json().then((validResponse) => {
            const fullName = `${validResponse.firstname} ${validResponse.lastname}`;
            setUserName(fullName);
          });
        } else {
          setUserName('');
        }
      });
  }, []);

  // authenticate if cannot get name of user
  useEffect(() => {
    if (userName === '') {
      fetch(authlinkUrl)
        .then((response) => response.json())
        .then((response) => {
          window.location.href = response.link;
        });
    }
    console.log(userName);
  }, [userName]);

  // get list of assos when user authenticated
  useEffect(() => {
    if (userName === '') return;
    fetch(assosUrl)
      .then((response) => response.json())
      .then((response) => {
        const newResponse = [];
        response.forEach((element) => {
          const newElement = element;
          newElement.active = false;
          newResponse.push(newElement);
        });
        console.log(newResponse);
        loadUser({ ...user, assos: newResponse });
      });
  }, [userName]);

  return (
    <ContentWrapper content={<HomeContent />} />
  );
};

const HomeWrapper = () => (
  <Provider>
    <Home />
  </Provider>
);

export default HomeWrapper;
