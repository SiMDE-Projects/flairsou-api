import React, { useEffect, useState } from 'react';
import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';
import HomeContent from '../../UI/organisms/HomeContent/HomeContent';

const Home = () => {
  const [userName, setUserName] = useState('NOT_FETCHED');

  const authlinkUrl = '/oauth/authlink';
  const userInfosUrl = '/proxy_pda/get_user_infos';

  useEffect(() => {
    fetch(userInfosUrl)
      .then((response) => {
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

  useEffect(() => {
    if (userName === '') {
      fetch(authlinkUrl)
        .then((response) => response.json())
        .then((response) => {
          window.location.href = response.link;
        });
    }
  }, [userName]);

  return (
    <ContentWrapper content={<HomeContent />} />
  );
};

export default Home;
