import React, { useEffect } from 'react';

/*
 * Petit composant qui permet d'appeler le back de l'application en
 * lui passant le code d'authentification récupéré, pour que le
 * back récupère le token depuis le portail.
 * TODO : on pourrait se passer de ce composant en renvoyant directement
 * le callback sur le backend (mais il faut modifier le callback uri
 * en conséquence)
 */
const OAuthComp = () => {
  // Fonction appelée uniquement au chargement du composant
  useEffect(() => {
    // récupération du code transmis sur l'URL de callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // route de l'API du back de l'application
    const url = `/api/oauth/request_token/${code}`;

    // redirection de la page pour faire une requête GET sur le back
    window.location.replace(url);
  }, []);

  // renvoi d'un fragment vide, pas important puisque la page est redirigée
  return (
    <></>
  );
};

export default OAuthComp;
