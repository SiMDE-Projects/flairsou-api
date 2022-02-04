import React, { useEffect, useState } from 'react';
import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';
import HomeContent from '../../UI/organisms/HomeContent/HomeContent';

const Home = () => {
  const [authLink, setAuthLink] = useState('');
  const [userName, setUserName] = useState('');

  const authlinkUrl = '/oauth/authlink';
  const userInfosUrl = '/proxy_pda/get_user_infos';

  useEffect(() => {
    fetch(authlinkUrl)
      .then((response) => response.json())
      .then((response) => {
        setAuthLink(response.link);
      });
  }, []);

  // chargement du composant
  useEffect(() => {
    fetch(userInfosUrl)
      .then((response) => {
        if (response.status === 200) {
          response.json().then((validResponse) => {
            const fullName = `${validResponse.firstname} ${validResponse.lastname}`;
            setUserName(fullName);
          });
        }
      });
  }, []);

  useEffect(() => {
    if (userName === '' && authLink !== '') {
      window.location.href = authLink;
    }
  }, [userName, authLink]);

  return (
    <ContentWrapper content={<HomeContent />} />
  );
};

export default Home;
