/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';

const UserInfo = () => {
  const [userName, setUserName] = useState('');
  const [authLink, setAuthLink] = useState('');
  const authlinkUrl = '/oauth/authlink';
  const logoutUrl = '/oauth/logout';
  const userInfosUrl = '/api/tmp/get_user_infos';

  // récupération du lien de connexion depuis le backend de Flairsou
  useEffect(() => {
    fetch(authlinkUrl)
      .then((response) => response.json())
      .then((response) => {
        setAuthLink(response.link);
      });
  }, []);

  // vérification si l'utilisateur est déjà connecté, uniquement au
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

  if (userName !== '') {
    // the user is connected, return a component with the name
    // of the user
    return (
      <>
        {userName}
        <a href={logoutUrl}>Déconnexion</a>
      </>
    );
  }

  // the user is not connected, display the login link

  return (
    <a href={authLink}>Connexion</a>
  );
};

export default UserInfo;
