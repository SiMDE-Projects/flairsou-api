import React, { useState, useEffect } from 'react';

import UserInfo from './UserInfo';

const HomePage = () => {
  const assoListLink = '/proxy_pda/get_list_assos';
  const [assosFetched, setAssosFetched] = useState('');

  /*
   * Récupération de la liste des associations pour l'utilisateur connecté
   * depuis le proxy_pda
   */
  useEffect(() => {
    fetch(assoListLink)
      .then((response) => response.json())
      .then((response) => {
        // la réponse est placée dans l'état local au composant
        setAssosFetched(response);
      });
  }, []);

  /*
   * Fonction qui construit récursivement une liste html des assos
   * pour lesquelles l'utilisateur a les droits en tréso
   */
  const buildAssosList = (assosArray) => {
    const list = [];
    for (let i = 0; i < assosArray.length; i += 1) {
      // on ajoute chaque asso dans la liste
      list.push(<li key={assosArray[i].asso_id}>{assosArray[i].shortname}</li>);

      // si l'asso a des sous-assos, on les ajoute en sous-liste
      if (assosArray[i].asso_set.length > 0) {
        list.push(buildAssosList(assosArray[i].asso_set));
      }
    }

    // on renvoie le tout dans une balise ul
    return (<ul>{list}</ul>);
  };

  if (assosFetched === '') {
    // aucune asso n'a été récupérée ici
    return (
      <UserInfo />
    );
  }

  return (
    <>
      <UserInfo />
      <p> Associations directes </p>
      <div>
        {
          // construction de la liste des assos à afficher
          buildAssosList(assosFetched.direct_assos)
        }
      </div>
      <p> Associations associées </p>
      <div>
        <ul>
          {
              assosFetched.associated_assos.map((asso) => (
                <li key={asso.asso_id}>{asso.shortname}</li>))
          }
        </ul>
      </div>
    </>
  );
};

export default HomePage;
