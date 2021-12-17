import React from 'react';

import { Link } from 'react-router-dom';

class BookList extends React.Component {
  constructor(props) {
    super(props);
    // TODO : passer la liste des assos en variable globale de l'app
    this.state = { assos: [] };
  }

  componentDidMount() {
    // quand le composant est chargé, on récupère la liste des assos
    fetch('/mock_portail/list_assos/3', { method: 'GET' })
      .then((response) => response.json())
      .then((response) => {
        // construction d'un dictionnaire contenant le nom et l'UUID de
        // l'asso, avec un champ pour la clé du livre de compte associé
        const assosDir = response.assos.map((asso) => {
          const tmpAsso = asso;
          tmpAsso.book_pk = 0;
          return tmpAsso;
        });
        this.setState({ assos: assosDir });
        this.fetchBooks();
      });
  }

  /*
   * Fonction qui récupère le livre associé à chaque association
   */
  fetchBooks() {
    const { assos } = this.state;
    assos.forEach((asso) => {
      // pour chaque association, on construit l'url de la requête API
      // qui permet de récupérer le livre associé
      const url = `/api/books/byEntity/${asso.uuid}/`;
      fetch(url, { method: 'GET' })
        .then((response) => response.json())
        .then((response) => {
          // si la réponse est de taille 1, il y a un livre associé
          // à l'association, on ajoute sa clé primaire au
          // dictionnaire dans la liste des assos
          if (response.length === 1) {
            // récupération de l'indice de l'association concernée
            const assoId = assos.findIndex((tmpAsso) => tmpAsso.uuid === response[0].entity);

            if (assoId === undefined) {
              // l'association renvoyée ne fait pas partie
              // de la liste des associations, arrêter ici
              return;
            }

            // mise à jour de l'état
            this.setState((prevState) => ({
              // reconstruction de la liste des assos
              assos: prevState.assos.map((tmpAsso) => {
                // pour chaque asso, si l'asso correspond à la
                // réponse, mettre à jour la clé du livre
                const assoRet = tmpAsso;
                if (assoRet.uuid === response[0].entity) {
                  assoRet.book_pk = response[0].pk;
                }
                return assoRet;
              }),
            }));
          }
        });
    });
  }

  render() {
    const { assos } = this.state;

    return (
      <>
        <h1>Liste des associations avec droits de trésorerie</h1>
        <ul>
          {assos.map((asso) => (
            <li key={asso.uuid}>
              {
              // création d'un lien vers la page associée
              // si le livre n'existe pas, on renvoie vers un lien de création
              }
              <Link to={asso.book_pk === 0 ? `/createBook?uuid=${asso.uuid}` : `/book?pk=${asso.book_pk}`}>
                { asso.nom }
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }
}

export default BookList;
